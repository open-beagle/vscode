/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/common/gettingStartedContent", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.walkthroughs = exports.startEntries = void 0;
    const setupIcon = (0, iconRegistry_1.registerIcon)('getting-started-setup', codicons_1.Codicon.zap, (0, nls_1.localize)(0, null));
    const beginnerIcon = (0, iconRegistry_1.registerIcon)('getting-started-beginner', codicons_1.Codicon.lightbulb, (0, nls_1.localize)(1, null));
    const intermediateIcon = (0, iconRegistry_1.registerIcon)('getting-started-intermediate', codicons_1.Codicon.mortarBoard, (0, nls_1.localize)(2, null));
    const codespacesIcon = (0, iconRegistry_1.registerIcon)('getting-started-codespaces', codicons_1.Codicon.github, (0, nls_1.localize)(3, null));
    exports.startEntries = [
        {
            id: 'topLevelNewFile',
            title: (0, nls_1.localize)(4, null),
            description: (0, nls_1.localize)(5, null),
            icon: codicons_1.Codicon.newFile,
            content: {
                type: 'startEntry',
                command: 'workbench.action.files.newUntitledFile',
            }
        },
        {
            id: 'topLevelOpenMac',
            title: (0, nls_1.localize)(6, null),
            description: (0, nls_1.localize)(7, null),
            icon: codicons_1.Codicon.folderOpened,
            when: 'isMac',
            content: {
                type: 'startEntry',
                command: 'workbench.action.files.openFileFolder',
            }
        },
        {
            id: 'topLevelOpenFile',
            title: (0, nls_1.localize)(8, null),
            description: (0, nls_1.localize)(9, null),
            icon: codicons_1.Codicon.goToFile,
            when: '!isMac',
            content: {
                type: 'startEntry',
                command: 'workbench.action.files.openFile',
            }
        },
        {
            id: 'topLevelOpenFolder',
            title: (0, nls_1.localize)(10, null),
            description: (0, nls_1.localize)(11, null),
            icon: codicons_1.Codicon.folderOpened,
            when: '!isMac',
            content: {
                type: 'startEntry',
                command: 'workbench.action.files.openFolder',
            }
        },
        {
            id: 'topLevelCloneRepo',
            title: (0, nls_1.localize)(12, null),
            description: (0, nls_1.localize)(13, null),
            icon: codicons_1.Codicon.repoClone,
            when: '!git.missing',
            content: {
                type: 'startEntry',
                command: 'git.clone',
            }
        },
        {
            id: 'topLevelCommandPalette',
            title: (0, nls_1.localize)(14, null),
            description: (0, nls_1.localize)(15, null),
            icon: codicons_1.Codicon.symbolColor,
            content: {
                type: 'startEntry',
                command: 'workbench.action.showCommands',
            }
        },
    ];
    exports.walkthroughs = [
        {
            id: 'Codespaces',
            title: (0, nls_1.localize)(16, null),
            icon: codespacesIcon,
            when: 'remoteName == codespaces',
            description: (0, nls_1.localize)(17, null),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'runProjectStep',
                        title: (0, nls_1.localize)(18, null),
                        description: (0, nls_1.localize)(19, null),
                        doneOn: { commandExecuted: 'workbench.action.debug.selectandstart' },
                        media: { type: 'image', altText: 'Node.js project running debug mode and paused.', path: 'runProject.png' },
                    },
                    {
                        id: 'forwardPortsStep',
                        title: (0, nls_1.localize)(20, null),
                        description: (0, nls_1.localize)(21, null),
                        doneOn: { commandExecuted: '~remote.forwardedPorts.focus' },
                        media: { type: 'image', altText: 'Ports panel.', path: 'forwardPorts.png' },
                    },
                    {
                        id: 'pullRequests',
                        title: (0, nls_1.localize)(22, null),
                        description: (0, nls_1.localize)(23, null),
                        doneOn: { commandExecuted: 'workbench.view.extension.github-pull-requests' },
                        media: { type: 'image', altText: 'Preview for reviewing a pull request.', path: 'pullRequests.png' },
                    },
                    {
                        id: 'remoteTerminal',
                        title: (0, nls_1.localize)(24, null),
                        description: (0, nls_1.localize)(25, null),
                        doneOn: { commandExecuted: 'terminal.focus' },
                        media: { type: 'image', altText: 'Remote terminal showing npm commands.', path: 'remoteTerminal.png' },
                    },
                    {
                        id: 'openVSC',
                        title: (0, nls_1.localize)(26, null),
                        description: (0, nls_1.localize)(27, null),
                        when: 'isWeb',
                        doneOn: { commandExecuted: 'github.codespaces.openInStable' },
                        media: {
                            type: 'image', altText: 'Preview of the Open in VS Code command.', path: {
                                dark: 'dark/openVSC.png',
                                light: 'light/openVSC.png',
                                hc: 'light/openVSC.png',
                            }
                        },
                    }
                ]
            }
        },
        {
            id: 'Setup',
            title: (0, nls_1.localize)(28, null),
            description: (0, nls_1.localize)(29, null),
            icon: setupIcon,
            when: 'remoteName != codespaces',
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'pickColorTheme',
                        title: (0, nls_1.localize)(30, null),
                        description: (0, nls_1.localize)(31, null),
                        doneOn: { commandExecuted: 'workbench.action.selectTheme' },
                        media: { type: 'image', altText: 'Color theme preview for dark and light theme.', path: 'colorTheme.png', }
                    },
                    {
                        id: 'findLanguageExtensions',
                        title: (0, nls_1.localize)(32, null),
                        description: (0, nls_1.localize)(33, null),
                        doneOn: { commandExecuted: 'workbench.extensions.action.showLanguageExtensions' },
                        media: {
                            type: 'image', altText: 'Language extensions', path: {
                                dark: 'dark/languageExtensions.png',
                                light: 'light/languageExtensions.png',
                                hc: 'hc/languageExtensions.png',
                            }
                        }
                    },
                    {
                        id: 'keymaps',
                        title: (0, nls_1.localize)(34, null),
                        description: (0, nls_1.localize)(35, null),
                        doneOn: { commandExecuted: 'workbench.extensions.action.showRecommendedKeymapExtensions' },
                        media: {
                            type: 'image', altText: 'List of keymap extensions.', path: {
                                dark: 'dark/keymaps.png',
                                light: 'light/keymaps.png',
                                hc: 'hc/keymaps.png',
                            },
                        }
                    },
                    {
                        id: 'settingsSync',
                        title: (0, nls_1.localize)(36, null),
                        description: (0, nls_1.localize)(37, null),
                        when: 'syncStatus != uninitialized',
                        doneOn: { eventFired: 'sync-enabled' },
                        media: {
                            type: 'image', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: {
                                dark: 'dark/settingsSync.png',
                                light: 'light/settingsSync.png',
                                hc: 'hc/settingsSync.png',
                            },
                        }
                    },
                    {
                        id: 'pickAFolderTask-Mac',
                        title: (0, nls_1.localize)(38, null),
                        description: (0, nls_1.localize)(39, null),
                        when: 'isMac && workspaceFolderCount == 0',
                        doneOn: { commandExecuted: 'workbench.action.files.openFileFolder' },
                        media: {
                            type: 'image', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: {
                                dark: 'dark/openFolder.png',
                                light: 'light/openFolder.png',
                                hc: 'hc/openFolder.png',
                            }
                        }
                    },
                    {
                        id: 'pickAFolderTask-Other',
                        title: (0, nls_1.localize)(40, null),
                        description: (0, nls_1.localize)(41, null),
                        when: '!isMac && workspaceFolderCount == 0',
                        doneOn: { commandExecuted: 'workbench.action.files.openFolder' },
                        media: {
                            type: 'image', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: {
                                dark: 'dark/openFolder.png',
                                light: 'light/openFolder.png',
                                hc: 'hc/openFolder.png',
                            }
                        }
                    },
                    {
                        id: 'quickOpen',
                        title: (0, nls_1.localize)(42, null),
                        description: (0, nls_1.localize)(43, null),
                        when: 'workspaceFolderCount != 0',
                        doneOn: { commandExecuted: 'workbench.action.quickOpen' },
                        media: {
                            type: 'image', altText: 'Go to file in quick search.', path: {
                                dark: 'dark/openFolder.png',
                                light: 'light/openFolder.png',
                                hc: 'hc/openFolder.png',
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'Beginner',
            title: (0, nls_1.localize)(44, null),
            icon: beginnerIcon,
            description: (0, nls_1.localize)(45, null),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'commandPaletteTask',
                        title: (0, nls_1.localize)(46, null),
                        description: (0, nls_1.localize)(47, null),
                        doneOn: { commandExecuted: 'workbench.action.showCommands' },
                        media: {
                            type: 'image', altText: 'Command Palette overlay for searching and executing commands.', path: {
                                dark: 'dark/commandPalette.png',
                                light: 'light/commandPalette.png',
                                hc: 'hc/commandPalette.png',
                            }
                        },
                    },
                    {
                        id: 'terminal',
                        title: (0, nls_1.localize)(48, null),
                        description: (0, nls_1.localize)(49, null),
                        when: 'remoteName != codespaces && !terminalIsOpen',
                        doneOn: { commandExecuted: 'workbench.action.terminal.toggleTerminal' },
                        media: {
                            type: 'image', altText: 'Integrated terminal running a few npm commands', path: {
                                dark: 'dark/terminal.png',
                                light: 'light/terminal.png',
                                hc: 'hc/terminal.png',
                            }
                        },
                    },
                    {
                        id: 'extensions',
                        title: (0, nls_1.localize)(50, null),
                        description: (0, nls_1.localize)(51, null),
                        doneOn: { commandExecuted: 'workbench.extensions.action.showRecommendedExtensions' },
                        media: {
                            type: 'image', altText: 'VS Code extension marketplace with featured language extensions', path: {
                                dark: 'dark/extensions.png',
                                light: 'light/extensions.png',
                                hc: 'hc/extensions.png',
                            }
                        },
                    },
                    {
                        id: 'settings',
                        title: (0, nls_1.localize)(52, null),
                        description: (0, nls_1.localize)(53, null),
                        doneOn: { commandExecuted: 'workbench.action.openSettings' },
                        media: {
                            type: 'image', altText: 'VS Code Settings', path: {
                                dark: 'dark/settings.png',
                                light: 'light/settings.png',
                                hc: 'hc/settings.png',
                            }
                        },
                    },
                    {
                        id: 'videoTutorial',
                        title: (0, nls_1.localize)(54, null),
                        description: (0, nls_1.localize)(55, null),
                        doneOn: { eventFired: 'linkOpened:https://aka.ms/vscode-getting-started-video' },
                        media: { type: 'image', altText: 'VS Code Settings', path: 'tutorialVideo.png' },
                    }
                ]
            }
        },
        {
            id: 'Intermediate',
            title: (0, nls_1.localize)(56, null),
            icon: intermediateIcon,
            description: (0, nls_1.localize)(57, null),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'playground',
                        title: (0, nls_1.localize)(58, null),
                        description: (0, nls_1.localize)(59, null),
                        doneOn: { commandExecuted: 'workbench.action.showInteractivePlayground' },
                        media: {
                            type: 'image', altText: 'Interactive Playground.', path: {
                                dark: 'dark/playground.png',
                                light: 'light/playground.png',
                                hc: 'light/playground.png'
                            },
                        },
                    },
                    {
                        id: 'splitview',
                        title: (0, nls_1.localize)(60, null),
                        description: (0, nls_1.localize)(61, null),
                        doneOn: { commandExecuted: 'workbench.action.splitEditor' },
                        media: {
                            type: 'image', altText: 'Multiple editors in split view.', path: {
                                dark: 'dark/splitview.png',
                                light: 'light/splitview.png',
                                hc: 'light/splitview.png'
                            },
                        },
                    },
                    {
                        id: 'debugging',
                        title: (0, nls_1.localize)(62, null),
                        description: (0, nls_1.localize)(63, null),
                        when: 'workspaceFolderCount != 0',
                        doneOn: { commandExecuted: 'workbench.action.debug.selectandstart' },
                        media: {
                            type: 'image', altText: 'Run and debug view.', path: {
                                dark: 'dark/debug.png',
                                light: 'light/debug.png',
                                hc: 'light/debug.png'
                            },
                        },
                    },
                    {
                        id: 'scmClone',
                        title: (0, nls_1.localize)(64, null),
                        description: (0, nls_1.localize)(65, null),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount == 0',
                        doneOn: { commandExecuted: 'git.clone' },
                        media: {
                            type: 'image', altText: 'Source Control view.', path: {
                                dark: 'dark/scm.png',
                                light: 'light/scm.png',
                                hc: 'light/scm.png'
                            },
                        },
                    },
                    {
                        id: 'scmSetup',
                        title: (0, nls_1.localize)(66, null),
                        description: (0, nls_1.localize)(67, null),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0',
                        doneOn: { commandExecuted: 'git.init' },
                        media: {
                            type: 'image', altText: 'Source Control view.', path: {
                                dark: 'dark/scm.png',
                                light: 'light/scm.png',
                                hc: 'light/scm.png'
                            },
                        },
                    },
                    {
                        id: 'scm',
                        title: (0, nls_1.localize)(68, null),
                        description: (0, nls_1.localize)(69, null),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != \'workbench.view.scm\'',
                        doneOn: { commandExecuted: 'workbench.view.scm.focus' },
                        media: {
                            type: 'image', altText: 'Source Control view.', path: {
                                dark: 'dark/scm.png',
                                light: 'light/scm.png',
                                hc: 'light/scm.png'
                            },
                        },
                    },
                    {
                        id: 'tasks',
                        title: (0, nls_1.localize)(70, null),
                        when: 'workspaceFolderCount != 0',
                        description: (0, nls_1.localize)(71, null),
                        doneOn: { commandExecuted: 'workbench.action.tasks.runTask' },
                        media: {
                            type: 'image', altText: 'Task runner.', path: {
                                dark: 'dark/tasks.png',
                                light: 'light/tasks.png',
                                hc: 'light/tasks.png'
                            },
                        },
                    },
                    {
                        id: 'shortcuts',
                        title: (0, nls_1.localize)(72, null),
                        description: (0, nls_1.localize)(73, null),
                        doneOn: { commandExecuted: 'workbench.action.openGlobalKeybindings' },
                        media: {
                            type: 'image', altText: 'Interactive shortcuts.', path: {
                                dark: 'dark/shortcuts.png',
                                light: 'light/shortcuts.png',
                                hc: 'light/shortcuts.png'
                            },
                        }
                    }
                ]
            }
        }
    ];
});
//# sourceMappingURL=gettingStartedContent.js.map