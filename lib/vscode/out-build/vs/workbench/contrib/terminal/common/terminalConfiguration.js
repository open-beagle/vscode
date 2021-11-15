/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/editor/common/config/editorOptions", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/platform"], function (require, exports, nls_1, editorOptions_1, terminal_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTerminalShellConfiguration = exports.getNoDefaultTerminalShellConfiguration = exports.terminalConfiguration = void 0;
    const terminalProfileSchema = {
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                description: (0, nls_1.localize)(0, null),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            },
            args: {
                description: (0, nls_1.localize)(1, null),
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            overrideName: {
                description: (0, nls_1.localize)(2, null),
                type: 'boolean'
            },
            icon: {
                description: (0, nls_1.localize)(3, null),
                type: 'string'
            },
            env: {
                markdownDescription: (0, nls_1.localize)(4, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            }
        }
    };
    exports.terminalConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)(5, null),
        type: 'object',
        properties: {
            'terminal.integrated.sendKeybindingsToShell': {
                markdownDescription: (0, nls_1.localize)(6, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.automationShell.linux': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(7, null, '`terminal.integrated.shell.linux`', '`shellArgs`'),



                type: ['string', 'null'],
                default: null
            },
            'terminal.integrated.automationShell.osx': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(8, null, '`terminal.integrated.shell.osx`', '`shellArgs`'),



                type: ['string', 'null'],
                default: null
            },
            'terminal.integrated.automationShell.windows': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(9, null, '`terminal.integrated.shell.windows`', '`shellArgs`'),



                type: ['string', 'null'],
                default: null
            },
            'terminal.integrated.shellArgs.linux': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(10, null),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: [],
                markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.linux#` instead'
            },
            'terminal.integrated.shellArgs.osx': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(11, null),
                type: 'array',
                items: {
                    type: 'string'
                },
                // Unlike on Linux, ~/.profile is not sourced when logging into a macOS session. This
                // is the reason terminals on macOS typically run login shells by default which set up
                // the environment. See http://unix.stackexchange.com/a/119675/115410
                default: ['-l'],
                markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.osx#` instead'
            },
            'terminal.integrated.shellArgs.windows': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(12, null),
                'anyOf': [
                    {
                        type: 'array',
                        items: {
                            type: 'string',
                            markdownDescription: (0, nls_1.localize)(13, null)
                        },
                    },
                    {
                        type: 'string',
                        markdownDescription: (0, nls_1.localize)(14, null)
                    }
                ],
                default: [],
                markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.windows#` instead'
            },
            'terminal.integrated.profiles.windows': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(15, null, '`source`', '`path`', '`args`.'),



                type: 'object',
                default: {
                    'PowerShell': {
                        source: 'PowerShell',
                        icon: 'terminal-powershell'
                    },
                    'Command Prompt': {
                        path: [
                            '${env:windir}\\Sysnative\\cmd.exe',
                            '${env:windir}\\System32\\cmd.exe'
                        ],
                        args: [],
                        icon: 'terminal-cmd'
                    },
                    'Git Bash': {
                        source: 'Git Bash'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['source'],
                            properties: {
                                source: {
                                    description: (0, nls_1.localize)(16, null),
                                    enum: ['PowerShell', 'Git Bash']
                                },
                                overrideName: {
                                    description: (0, nls_1.localize)(17, null),
                                    type: 'boolean'
                                },
                                icon: {
                                    description: (0, nls_1.localize)(18, null),
                                    type: 'string'
                                },
                                env: {
                                    markdownDescription: (0, nls_1.localize)(19, null),
                                    type: 'object',
                                    additionalProperties: {
                                        type: ['string', 'null']
                                    },
                                    default: {}
                                }
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            'terminal.integrated.profiles.osx': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(20, null, '`path`', '`args`.'),



                type: 'object',
                default: {
                    'bash': {
                        path: 'bash',
                        icon: 'terminal-bash'
                    },
                    'zsh': {
                        path: 'zsh'
                    },
                    'fish': {
                        path: 'fish'
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            'terminal.integrated.profiles.linux': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(21, null, '`path`', '`args`.'),



                type: 'object',
                default: {
                    'bash': {
                        path: 'bash'
                    },
                    'zsh': {
                        path: 'zsh'
                    },
                    'fish': {
                        path: 'fish'
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            'terminal.integrated.defaultProfile.linux': {
                description: (0, nls_1.localize)(22, null),
                type: ['string', 'null'],
                default: null,
                scope: 1 /* APPLICATION */ // Disallow setting the default in workspace settings
            },
            'terminal.integrated.defaultProfile.osx': {
                description: (0, nls_1.localize)(23, null),
                type: ['string', 'null'],
                default: null,
                scope: 1 /* APPLICATION */ // Disallow setting the default in workspace settings
            },
            'terminal.integrated.defaultProfile.windows': {
                description: (0, nls_1.localize)(24, null),
                type: ['string', 'null'],
                default: null,
                scope: 1 /* APPLICATION */ // Disallow setting the default in workspace settings
            },
            'terminal.integrated.useWslProfiles': {
                description: (0, nls_1.localize)(25, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.tabs.enabled': {
                description: (0, nls_1.localize)(26, null),
                type: 'boolean',
                default: false,
            },
            'terminal.integrated.tabs.hideCondition': {
                description: (0, nls_1.localize)(27, null),
                type: 'string',
                enum: ['never', 'singleTerminal'],
                enumDescriptions: [
                    (0, nls_1.localize)(28, null),
                    (0, nls_1.localize)(29, null),
                ],
                default: 'singleTerminal',
            },
            'terminal.integrated.tabs.showActiveTerminal': {
                description: (0, nls_1.localize)(30, null),
                type: 'string',
                enum: ['always', 'singleTerminal', 'singleTerminalOrNarrow', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(31, null),
                    (0, nls_1.localize)(32, null),
                    (0, nls_1.localize)(33, null),
                    (0, nls_1.localize)(34, null),
                ],
                default: 'singleTerminalOrNarrow',
            },
            'terminal.integrated.tabs.location': {
                type: 'string',
                enum: ['left', 'right'],
                enumDescriptions: [
                    (0, nls_1.localize)(35, null),
                    (0, nls_1.localize)(36, null)
                ],
                default: 'right',
                description: (0, nls_1.localize)(37, null)
            },
            'terminal.integrated.tabs.focusMode': {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                enumDescriptions: [
                    (0, nls_1.localize)(38, null),
                    (0, nls_1.localize)(39, null)
                ],
                default: 'doubleClick',
                description: (0, nls_1.localize)(40, null)
            },
            'terminal.integrated.macOptionIsMeta': {
                description: (0, nls_1.localize)(41, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.macOptionClickForcesSelection': {
                description: (0, nls_1.localize)(42, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.altClickMovesCursor': {
                markdownDescription: (0, nls_1.localize)(43, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.copyOnSelection': {
                description: (0, nls_1.localize)(44, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.drawBoldTextInBrightColors': {
                description: (0, nls_1.localize)(45, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.fontFamily': {
                markdownDescription: (0, nls_1.localize)(46, null),
                type: 'string'
            },
            // TODO: Support font ligatures
            // 'terminal.integrated.fontLigatures': {
            // 	'description': localize('terminal.integrated.fontLigatures', "Controls whether font ligatures are enabled in the terminal."),
            // 	'type': 'boolean',
            // 	'default': false
            // },
            'terminal.integrated.fontSize': {
                description: (0, nls_1.localize)(47, null),
                type: 'number',
                default: editorOptions_1.EDITOR_FONT_DEFAULTS.fontSize
            },
            'terminal.integrated.letterSpacing': {
                description: (0, nls_1.localize)(48, null),
                type: 'number',
                default: terminal_1.DEFAULT_LETTER_SPACING
            },
            'terminal.integrated.lineHeight': {
                description: (0, nls_1.localize)(49, null),
                type: 'number',
                default: terminal_1.DEFAULT_LINE_HEIGHT
            },
            'terminal.integrated.minimumContrastRatio': {
                markdownDescription: (0, nls_1.localize)(50, null),
                type: 'number',
                default: 1
            },
            'terminal.integrated.fastScrollSensitivity': {
                markdownDescription: (0, nls_1.localize)(51, null),
                type: 'number',
                default: 5
            },
            'terminal.integrated.mouseWheelScrollSensitivity': {
                markdownDescription: (0, nls_1.localize)(52, null),
                type: 'number',
                default: 1
            },
            'terminal.integrated.bellDuration': {
                markdownDescription: (0, nls_1.localize)(53, null),
                type: 'number',
                default: 1000
            },
            'terminal.integrated.fontWeight': {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.MINIMUM_FONT_WEIGHT,
                        maximum: terminal_1.MAXIMUM_FONT_WEIGHT,
                        errorMessage: (0, nls_1.localize)(54, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.SUGGESTIONS_FONT_WEIGHT,
                    }
                ],
                description: (0, nls_1.localize)(55, null),
                default: 'normal'
            },
            'terminal.integrated.fontWeightBold': {
                'anyOf': [
                    {
                        type: 'number',
                        minimum: terminal_1.MINIMUM_FONT_WEIGHT,
                        maximum: terminal_1.MAXIMUM_FONT_WEIGHT,
                        errorMessage: (0, nls_1.localize)(56, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: terminal_1.SUGGESTIONS_FONT_WEIGHT,
                    }
                ],
                description: (0, nls_1.localize)(57, null),
                default: 'bold'
            },
            'terminal.integrated.cursorBlinking': {
                description: (0, nls_1.localize)(58, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.cursorStyle': {
                description: (0, nls_1.localize)(59, null),
                enum: [terminal_1.TerminalCursorStyle.BLOCK, terminal_1.TerminalCursorStyle.LINE, terminal_1.TerminalCursorStyle.UNDERLINE],
                default: terminal_1.TerminalCursorStyle.BLOCK
            },
            'terminal.integrated.cursorWidth': {
                markdownDescription: (0, nls_1.localize)(60, null),
                type: 'number',
                default: 1
            },
            'terminal.integrated.scrollback': {
                description: (0, nls_1.localize)(61, null),
                type: 'number',
                default: 1000
            },
            'terminal.integrated.detectLocale': {
                markdownDescription: (0, nls_1.localize)(62, null),
                type: 'string',
                enum: ['auto', 'off', 'on'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(63, null),
                    (0, nls_1.localize)(64, null),
                    (0, nls_1.localize)(65, null)
                ],
                default: 'auto'
            },
            'terminal.integrated.gpuAcceleration': {
                type: 'string',
                enum: ['auto', 'on', 'off'],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(66, null),
                    (0, nls_1.localize)(67, null),
                    (0, nls_1.localize)(68, null)
                ],
                default: 'auto',
                description: (0, nls_1.localize)(69, null)
            },
            'terminal.integrated.rightClickBehavior': {
                type: 'string',
                enum: ['default', 'copyPaste', 'paste', 'selectWord'],
                enumDescriptions: [
                    (0, nls_1.localize)(70, null),
                    (0, nls_1.localize)(71, null),
                    (0, nls_1.localize)(72, null),
                    (0, nls_1.localize)(73, null)
                ],
                default: platform_1.isMacintosh ? 'selectWord' : platform_1.isWindows ? 'copyPaste' : 'default',
                description: (0, nls_1.localize)(74, null)
            },
            'terminal.integrated.cwd': {
                restricted: true,
                description: (0, nls_1.localize)(75, null),
                type: 'string',
                default: undefined
            },
            'terminal.integrated.confirmOnExit': {
                description: (0, nls_1.localize)(76, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.enableBell': {
                description: (0, nls_1.localize)(77, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.commandsToSkipShell': {
                markdownDescription: (0, nls_1.localize)(78, null, terminal_1.DEFAULT_COMMANDS_TO_SKIP_SHELL.sort().map(command => `- ${command}`).join('\n')),
                type: 'array',
                items: {
                    type: 'string'
                },
                default: []
            },
            'terminal.integrated.allowChords': {
                markdownDescription: (0, nls_1.localize)(79, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.allowMnemonics': {
                markdownDescription: (0, nls_1.localize)(80, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.inheritEnv': {
                markdownDescription: (0, nls_1.localize)(81, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.env.osx': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(82, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            'terminal.integrated.env.linux': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(83, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            'terminal.integrated.env.windows': {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(84, null),
                type: 'object',
                additionalProperties: {
                    type: ['string', 'null']
                },
                default: {}
            },
            'terminal.integrated.environmentChangesIndicator': {
                markdownDescription: (0, nls_1.localize)(85, null),
                type: 'string',
                enum: ['off', 'on', 'warnonly'],
                enumDescriptions: [
                    (0, nls_1.localize)(86, null),
                    (0, nls_1.localize)(87, null),
                    (0, nls_1.localize)(88, null),
                ],
                default: 'warnonly'
            },
            'terminal.integrated.environmentChangesRelaunch': {
                markdownDescription: (0, nls_1.localize)(89, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.showExitAlert': {
                description: (0, nls_1.localize)(90, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.splitCwd': {
                description: (0, nls_1.localize)(91, null),
                type: 'string',
                enum: ['workspaceRoot', 'initial', 'inherited'],
                enumDescriptions: [
                    (0, nls_1.localize)(92, null),
                    (0, nls_1.localize)(93, null),
                    (0, nls_1.localize)(94, null),
                ],
                default: 'inherited'
            },
            'terminal.integrated.windowsEnableConpty': {
                description: (0, nls_1.localize)(95, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.wordSeparators': {
                description: (0, nls_1.localize)(96, null),
                type: 'string',
                default: ' ()[]{}\',"`─'
            },
            'terminal.integrated.experimentalUseTitleEvent': {
                description: (0, nls_1.localize)(97, null),
                type: 'boolean',
                default: false
            },
            'terminal.integrated.enableFileLinks': {
                description: (0, nls_1.localize)(98, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.unicodeVersion': {
                type: 'string',
                enum: ['6', '11'],
                enumDescriptions: [
                    (0, nls_1.localize)(99, null),
                    (0, nls_1.localize)(100, null)
                ],
                default: '11',
                description: (0, nls_1.localize)(101, null)
            },
            'terminal.integrated.experimentalLinkProvider': {
                description: (0, nls_1.localize)(102, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.localEchoLatencyThreshold': {
                description: (0, nls_1.localize)(103, null),
                type: 'integer',
                minimum: -1,
                default: 30,
            },
            'terminal.integrated.localEchoExcludePrograms': {
                description: (0, nls_1.localize)(104, null),
                type: 'array',
                items: {
                    type: 'string',
                    uniqueItems: true
                },
                default: terminal_1.DEFAULT_LOCAL_ECHO_EXCLUDE,
            },
            'terminal.integrated.localEchoStyle': {
                description: (0, nls_1.localize)(105, null),
                default: 'dim',
                oneOf: [
                    {
                        type: 'string',
                        default: 'dim',
                        enum: ['bold', 'dim', 'italic', 'underlined', 'inverted'],
                    },
                    {
                        type: 'string',
                        format: 'color-hex',
                        default: '#ff0000',
                    }
                ]
            },
            'terminal.integrated.enablePersistentSessions': {
                description: (0, nls_1.localize)(106, null),
                type: 'boolean',
                default: true
            },
            'terminal.integrated.allowWorkspaceConfiguration': {
                scope: 1 /* APPLICATION */,
                description: (0, nls_1.localize)(107, null),
                type: 'boolean',
                default: false
            }
        }
    };
    function getTerminalShellConfigurationStub(linux, osx, windows) {
        return {
            id: 'terminal',
            order: 100,
            title: (0, nls_1.localize)(108, null),
            type: 'object',
            properties: {
                'terminal.integrated.shell.linux': {
                    restricted: true,
                    markdownDescription: linux,
                    type: ['string', 'null'],
                    default: null,
                    markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.linux#` instead'
                },
                'terminal.integrated.shell.osx': {
                    restricted: true,
                    markdownDescription: osx,
                    type: ['string', 'null'],
                    default: null,
                    markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.osx#` instead'
                },
                'terminal.integrated.shell.windows': {
                    restricted: true,
                    markdownDescription: windows,
                    type: ['string', 'null'],
                    default: null,
                    markdownDeprecationMessage: 'This is deprecated, use `#terminal.integrated.defaultProfile.windows#` instead'
                }
            }
        };
    }
    function getNoDefaultTerminalShellConfiguration() {
        return getTerminalShellConfigurationStub((0, nls_1.localize)(109, null), (0, nls_1.localize)(110, null), (0, nls_1.localize)(111, null));
    }
    exports.getNoDefaultTerminalShellConfiguration = getNoDefaultTerminalShellConfiguration;
    async function getTerminalShellConfiguration(getSystemShell) {
        return getTerminalShellConfigurationStub((0, nls_1.localize)(112, null, await getSystemShell(3 /* Linux */)), (0, nls_1.localize)(113, null, await getSystemShell(2 /* Macintosh */)), (0, nls_1.localize)(114, null, await getSystemShell(1 /* Windows */)));
    }
    exports.getTerminalShellConfiguration = getTerminalShellConfiguration;
});
//# sourceMappingURL=terminalConfiguration.js.map