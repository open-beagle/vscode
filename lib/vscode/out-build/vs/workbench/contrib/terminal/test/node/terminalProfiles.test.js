/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/workbench/contrib/terminal/node/terminalProfiles"], function (require, exports, assert_1, platform_1, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Assets that two profiles objects are equal, this will treat explicit undefined and unset
     * properties the same. Order of the profiles is ignored.
     */
    function profilesEqual(actualProfiles, expectedProfiles) {
        (0, assert_1.strictEqual)(actualProfiles.length, expectedProfiles.length);
        for (const expected of expectedProfiles) {
            const actual = actualProfiles.find(e => e.profileName === expected.profileName);
            (0, assert_1.ok)(actual, `Expected profile ${expected.profileName} not found`);
            (0, assert_1.strictEqual)(actual.profileName, expected.profileName);
            (0, assert_1.strictEqual)(actual.path, expected.path);
            (0, assert_1.deepStrictEqual)(actual.args, expected.args);
            (0, assert_1.strictEqual)(actual.isAutoDetected, expected.isAutoDetected);
            (0, assert_1.strictEqual)(actual.overrideName, expected.overrideName);
        }
    }
    function buildTestSafeConfigProvider(config) {
        return (key) => {
            switch (key) {
                case 'terminal.integrated.profiles.linux': return config.profiles.linux;
                case 'terminal.integrated.profiles.osx': return config.profiles.osx;
                case 'terminal.integrated.profiles.windows': return config.profiles.windows;
                case 'terminal.integrated.useWslProfiles': return config.useWslProfiles;
                default: throw new Error('Unexpected config key');
            }
        };
    }
    suite('Workbench - TerminalProfiles', () => {
        suite('detectAvailableProfiles', () => {
            if (platform_1.isWindows) {
                test('should detect Git Bash and provide login args', async () => {
                    const fsProvider = createFsProvider([
                        'C:\\Program Files\\Git\\bin\\bash.exe'
                    ]);
                    const config = {
                        profiles: {
                            windows: {
                                'Git Bash': { source: "Git Bash" /* GitBash */ }
                            },
                            linux: {},
                            osx: {}
                        },
                        useWslProfiles: false
                    };
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(config), fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', args: ['--login'] }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should allow source to have args', async () => {
                    const fsProvider = createFsProvider([
                        'C:\\Program Files\\PowerShell\\7\\pwsh.exe'
                    ]);
                    const config = {
                        profiles: {
                            windows: {
                                'PowerShell NoProfile': { source: "PowerShell" /* Pwsh */, args: ['-NoProfile'], overrideName: true }
                            },
                            linux: {},
                            osx: {},
                        },
                        useWslProfiles: false
                    };
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(config), fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'PowerShell NoProfile', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe', overrideName: true, args: ['-NoProfile'] }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('configured args should override default source ones', async () => {
                    const fsProvider = createFsProvider([
                        'C:\\Program Files\\Git\\bin\\bash.exe'
                    ]);
                    const config = {
                        profiles: {
                            windows: {
                                'Git Bash': { source: "Git Bash" /* GitBash */, args: [] }
                            },
                            linux: {},
                            osx: {}
                        },
                        useWslProfiles: false
                    };
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(config), fsProvider, undefined, undefined, undefined);
                    const expected = [{ profileName: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', args: [], isAutoDetected: undefined, overrideName: undefined }];
                    profilesEqual(profiles, expected);
                });
                suite('pwsh source detection/fallback', async () => {
                    const pwshSourceConfig = {
                        profiles: {
                            windows: {
                                'PowerShell': { source: "PowerShell" /* Pwsh */ }
                            },
                            linux: {},
                            osx: {},
                        },
                        useWslProfiles: false
                    };
                    test('should prefer pwsh 7 to Windows PowerShell', async () => {
                        const fsProvider = createFsProvider([
                            'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                            'C:\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ]);
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(pwshSourceConfig), fsProvider, undefined, undefined, undefined);
                        const expected = [
                            { profileName: 'PowerShell', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe' }
                        ];
                        profilesEqual(profiles, expected);
                    });
                    test('should prefer pwsh 7 to pwsh 6', async () => {
                        const fsProvider = createFsProvider([
                            'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                            'C:\\Program Files\\PowerShell\\6\\pwsh.exe',
                            'C:\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ]);
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(pwshSourceConfig), fsProvider, undefined, undefined, undefined);
                        const expected = [
                            { profileName: 'PowerShell', path: 'C:\\Program Files\\PowerShell\\7\\pwsh.exe' }
                        ];
                        profilesEqual(profiles, expected);
                    });
                    test.skip('should fallback to Windows PowerShell', async () => {
                        const fsProvider = createFsProvider([
                            'C:\\Windows\\Sysnative\\WindowsPowerShell\\v1.0\\powershell.exe',
                            'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                        ]);
                        const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(pwshSourceConfig), fsProvider, undefined, undefined, undefined);
                        (0, assert_1.strictEqual)(profiles.length, 1);
                        (0, assert_1.strictEqual)(profiles[0].profileName, 'PowerShell');
                    });
                });
            }
            else {
                const absoluteConfig = {
                    profiles: {
                        windows: {},
                        osx: {
                            'fakeshell1': { path: '/bin/fakeshell1' },
                            'fakeshell2': { path: '/bin/fakeshell2' },
                            'fakeshell3': { path: '/bin/fakeshell3' }
                        },
                        linux: {
                            'fakeshell1': { path: '/bin/fakeshell1' },
                            'fakeshell2': { path: '/bin/fakeshell2' },
                            'fakeshell3': { path: '/bin/fakeshell3' }
                        }
                    },
                    useWslProfiles: false
                };
                const onPathConfig = {
                    profiles: {
                        windows: {},
                        osx: {
                            'fakeshell1': { path: 'fakeshell1' },
                            'fakeshell2': { path: 'fakeshell2' },
                            'fakeshell3': { path: 'fakeshell3' }
                        },
                        linux: {
                            'fakeshell1': { path: 'fakeshell1' },
                            'fakeshell2': { path: 'fakeshell2' },
                            'fakeshell3': { path: 'fakeshell3' }
                        }
                    },
                    useWslProfiles: false
                };
                test('should detect shells via absolute paths', async () => {
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1',
                        '/bin/fakeshell3'
                    ]);
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(true, buildTestSafeConfigProvider(absoluteConfig), fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: '/bin/fakeshell1' },
                        { profileName: 'fakeshell3', path: '/bin/fakeshell3' }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should auto detect shells via /etc/shells', async () => {
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1',
                        '/bin/fakeshell3'
                    ], '/bin/fakeshell1\n/bin/fakeshell3');
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(false, buildTestSafeConfigProvider(onPathConfig), fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: 'fakeshell1' },
                        { profileName: 'fakeshell3', path: 'fakeshell3' }
                    ];
                    profilesEqual(profiles, expected);
                });
                test('should validate auto detected shells from /etc/shells exist', async () => {
                    // fakeshell3 exists in /etc/shells but not on FS
                    const fsProvider = createFsProvider([
                        '/bin/fakeshell1'
                    ], '/bin/fakeshell1\n/bin/fakeshell3');
                    const profiles = await (0, terminalProfiles_1.detectAvailableProfiles)(false, buildTestSafeConfigProvider(onPathConfig), fsProvider, undefined, undefined, undefined);
                    const expected = [
                        { profileName: 'fakeshell1', path: 'fakeshell1' }
                    ];
                    profilesEqual(profiles, expected);
                });
            }
        });
        function createFsProvider(expectedPaths, etcShellsContent = '') {
            const provider = {
                async existsFile(path) {
                    return expectedPaths.includes(path);
                },
                async readFile(path, options) {
                    if (path !== '/etc/shells') {
                        (0, assert_1.fail)('Unexected path');
                    }
                    return etcShellsContent;
                }
            };
            return provider;
        }
    });
});
//# sourceMappingURL=terminalProfiles.test.js.map