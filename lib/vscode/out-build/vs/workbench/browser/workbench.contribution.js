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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/browser/workbench.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/platform", "vs/workbench/common/configuration", "vs/base/browser/browser", "vs/workbench/common/contributions", "vs/workbench/services/experiment/common/experimentService"], function (require, exports, platform_1, nls_1, configurationRegistry_1, platform_2, configuration_1, browser_1, contributions_1, experimentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    // Configuration
    (function registerConfiguration() {
        // Workbench
        registry.registerConfiguration(Object.assign(Object.assign({}, configuration_1.workbenchConfigurationNodeBase), { 'properties': {
                'workbench.editor.titleScrollbarSizing': {
                    type: 'string',
                    enum: ['default', 'large'],
                    enumDescriptions: [
                        (0, nls_1.localize)(0, null),
                        (0, nls_1.localize)(1, null)
                    ],
                    description: (0, nls_1.localize)(2, null),
                    default: 'default',
                },
                'workbench.editor.showTabs': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(3, null),
                    'default': true
                },
                'workbench.editor.wrapTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(4, null),
                    'default': false
                },
                'workbench.editor.scrollToSwitchTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(5, null),
                    'default': false
                },
                'workbench.editor.highlightModifiedTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(6, null),
                    'default': false
                },
                'workbench.editor.decorations.badges': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(7, null),
                    'default': true
                },
                'workbench.editor.decorations.colors': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(8, null),
                    'default': true
                },
                'workbench.editor.labelFormat': {
                    'type': 'string',
                    'enum': ['default', 'short', 'medium', 'long'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(9, null),
                        (0, nls_1.localize)(10, null),
                        (0, nls_1.localize)(11, null),
                        (0, nls_1.localize)(12, null)
                    ],
                    'default': 'default',
                    'description': (0, nls_1.localize)(13, null),



                },
                'workbench.editor.untitled.labelFormat': {
                    'type': 'string',
                    'enum': ['content', 'name'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(14, null),
                        (0, nls_1.localize)(15, null),
                    ],
                    'default': 'content',
                    'description': (0, nls_1.localize)(16, null),



                },
                'workbench.editor.untitled.hint': {
                    'type': 'string',
                    'enum': ['text', 'hidden', 'default'],
                    'default': 'default',
                    'markdownDescription': (0, nls_1.localize)(17, null)
                },
                'workbench.editor.tabCloseButton': {
                    'type': 'string',
                    'enum': ['left', 'right', 'off'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(18, null)
                },
                'workbench.editor.tabSizing': {
                    'type': 'string',
                    'enum': ['fit', 'shrink'],
                    'default': 'fit',
                    'enumDescriptions': [
                        (0, nls_1.localize)(19, null),
                        (0, nls_1.localize)(20, null)
                    ],
                    'markdownDescription': (0, nls_1.localize)(21, null)
                },
                'workbench.editor.pinnedTabSizing': {
                    'type': 'string',
                    'enum': ['normal', 'compact', 'shrink'],
                    'default': 'normal',
                    'enumDescriptions': [
                        (0, nls_1.localize)(22, null),
                        (0, nls_1.localize)(23, null),
                        (0, nls_1.localize)(24, null)
                    ],
                    'markdownDescription': (0, nls_1.localize)(25, null)
                },
                'workbench.editor.splitSizing': {
                    'type': 'string',
                    'enum': ['distribute', 'split'],
                    'default': 'distribute',
                    'enumDescriptions': [
                        (0, nls_1.localize)(26, null),
                        (0, nls_1.localize)(27, null)
                    ],
                    'description': (0, nls_1.localize)(28, null)
                },
                'workbench.editor.splitOnDragAndDrop': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(29, null)
                },
                'workbench.editor.focusRecentEditorAfterClose': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(30, null),
                    'default': true
                },
                'workbench.editor.showIcons': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(31, null),
                    'default': true
                },
                'workbench.editor.enablePreview': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(32, null),
                    'default': true
                },
                'workbench.editor.enablePreviewFromQuickOpen': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(33, null),
                    'default': false
                },
                'workbench.editor.enablePreviewFromCodeNavigation': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(34, null),
                    'default': false
                },
                'workbench.editor.closeOnFileDelete': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(35, null),
                    'default': false
                },
                'workbench.editor.openPositioning': {
                    'type': 'string',
                    'enum': ['left', 'right', 'first', 'last'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(36, null)
                },
                'workbench.editor.openSideBySideDirection': {
                    'type': 'string',
                    'enum': ['right', 'down'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(37, null)
                },
                'workbench.editor.closeEmptyGroups': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(38, null),
                    'default': true
                },
                'workbench.editor.revealIfOpen': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(39, null),
                    'default': false
                },
                'workbench.editor.mouseBackForwardToNavigate': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(40, null),
                    'default': true
                },
                'workbench.editor.restoreViewState': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(41, null),
                    'default': true,
                    'scope': 5 /* LANGUAGE_OVERRIDABLE */
                },
                'workbench.editor.centeredLayoutAutoResize': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(42, null)
                },
                'workbench.editor.limit.enabled': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(43, null)
                },
                'workbench.editor.limit.value': {
                    'type': 'number',
                    'default': 10,
                    'exclusiveMinimum': 0,
                    'markdownDescription': (0, nls_1.localize)(44, null)
                },
                'workbench.editor.limit.perEditorGroup': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(45, null)
                },
                'workbench.commandPalette.history': {
                    'type': 'number',
                    'description': (0, nls_1.localize)(46, null),
                    'default': 50
                },
                'workbench.commandPalette.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(47, null),
                    'default': false
                },
                'workbench.quickOpen.closeOnFocusLost': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(48, null),
                    'default': true
                },
                'workbench.quickOpen.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(49, null),
                    'default': false
                },
                'workbench.settings.openDefaultSettings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(50, null),
                    'default': false
                },
                'workbench.settings.useSplitJSON': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(51, null),
                    'default': false
                },
                'workbench.settings.openDefaultKeybindings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(52, null),
                    'default': false
                },
                'workbench.sideBar.location': {
                    'type': 'string',
                    'enum': ['left', 'right'],
                    'default': 'left',
                    'description': (0, nls_1.localize)(53, null)
                },
                'workbench.panel.defaultLocation': {
                    'type': 'string',
                    'enum': ['left', 'bottom', 'right'],
                    'default': 'bottom',
                    'description': (0, nls_1.localize)(54, null)
                },
                'workbench.panel.opensMaximized': {
                    'type': 'string',
                    'enum': ['always', 'never', 'preserve'],
                    'default': 'preserve',
                    'description': (0, nls_1.localize)(55, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(56, null),
                        (0, nls_1.localize)(57, null),
                        (0, nls_1.localize)(58, null)
                    ]
                },
                'workbench.statusBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(59, null)
                },
                'workbench.activityBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(60, null)
                },
                'workbench.activityBar.iconClickBehavior': {
                    'type': 'string',
                    'enum': ['toggle', 'focus'],
                    'default': 'toggle',
                    'description': (0, nls_1.localize)(61, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(62, null),
                        (0, nls_1.localize)(63, null)
                    ]
                },
                'workbench.view.alwaysShowHeaderActions': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(64, null)
                },
                'workbench.fontAliasing': {
                    'type': 'string',
                    'enum': ['default', 'antialiased', 'none', 'auto'],
                    'default': 'default',
                    'description': (0, nls_1.localize)(65, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(66, null),
                        (0, nls_1.localize)(67, null),
                        (0, nls_1.localize)(68, null),
                        (0, nls_1.localize)(69, null)
                    ],
                    'included': platform_2.isMacintosh
                },
                'workbench.settings.editor': {
                    'type': 'string',
                    'enum': ['ui', 'json'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(70, null),
                        (0, nls_1.localize)(71, null),
                    ],
                    'description': (0, nls_1.localize)(72, null),
                    'default': 'ui',
                    'scope': 3 /* WINDOW */
                },
                'workbench.hover.delay': {
                    'type': 'number',
                    'description': (0, nls_1.localize)(73, null),
                    // Testing has indicated that on Windows and Linux 500 ms matches the native hovers most closely.
                    // On Mac, the delay is 1500.
                    'default': platform_2.isMacintosh ? 1500 : 500
                }
            } }));
        // Window
        let windowTitleDescription = (0, nls_1.localize)(74, null);
        windowTitleDescription += '\n- ' + [
            (0, nls_1.localize)(75, null),
            (0, nls_1.localize)(76, null),
            (0, nls_1.localize)(77, null),
            (0, nls_1.localize)(78, null),
            (0, nls_1.localize)(79, null),
            (0, nls_1.localize)(80, null),
            (0, nls_1.localize)(81, null),
            (0, nls_1.localize)(82, null),
            (0, nls_1.localize)(83, null),
            (0, nls_1.localize)(84, null),
            (0, nls_1.localize)(85, null),
            (0, nls_1.localize)(86, null),
            (0, nls_1.localize)(87, null),
            (0, nls_1.localize)(88, null)
        ].join('\n- '); // intentionally concatenated to not produce a string that is too long for translations
        registry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': (0, nls_1.localize)(89, null),
            'type': 'object',
            'properties': {
                'window.title': {
                    'type': 'string',
                    'default': (() => {
                        if (platform_2.isMacintosh && platform_2.isNative) {
                            return '${activeEditorShort}${separator}${rootName}'; // macOS has native dirty indicator
                        }
                        const base = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${appName}';
                        if (platform_2.isWeb) {
                            return base + '${separator}${remoteName}'; // Web: always show remote name
                        }
                        return base;
                    })(),
                    'markdownDescription': windowTitleDescription
                },
                'window.titleSeparator': {
                    'type': 'string',
                    'default': platform_2.isMacintosh ? ' — ' : ' - ',
                    'markdownDescription': (0, nls_1.localize)(90, null)
                },
                'window.menuBarVisibility': {
                    'type': 'string',
                    'enum': ['classic', 'visible', 'toggle', 'hidden', 'compact'],
                    'markdownEnumDescriptions': [
                        (0, nls_1.localize)(91, null),
                        (0, nls_1.localize)(92, null),
                        platform_2.isMacintosh ?
                            (0, nls_1.localize)(93, null) :
                            (0, nls_1.localize)(94, null),
                        (0, nls_1.localize)(95, null),
                        (0, nls_1.localize)(96, null)
                    ],
                    'default': platform_2.isWeb ? 'compact' : 'classic',
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': platform_2.isMacintosh ?
                        (0, nls_1.localize)(97, null) :
                        (0, nls_1.localize)(98, null),
                    'included': platform_2.isWindows || platform_2.isLinux || platform_2.isWeb
                },
                'window.enableMenuBarMnemonics': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(99, null),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.customMenuBarAltFocus': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(100, null),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.openFilesInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(101, null),
                        (0, nls_1.localize)(102, null),
                        platform_2.isMacintosh ?
                            (0, nls_1.localize)(103, null) :
                            (0, nls_1.localize)(104, null)
                    ],
                    'default': 'off',
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': platform_2.isMacintosh ?
                        (0, nls_1.localize)(105, null) :
                        (0, nls_1.localize)(106, null)
                },
                'window.openFoldersInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(107, null),
                        (0, nls_1.localize)(108, null),
                        (0, nls_1.localize)(109, null)
                    ],
                    'default': 'default',
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(110, null)
                },
                'window.confirmBeforeClose': {
                    'type': 'string',
                    'enum': ['always', 'keyboardOnly', 'never'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(111, null),
                        (0, nls_1.localize)(112, null),
                        (0, nls_1.localize)(113, null)
                    ],
                    'default': platform_2.isWeb && !browser_1.isStandalone ? 'keyboardOnly' : 'never',
                    'description': (0, nls_1.localize)(114, null),
                    'scope': 1 /* APPLICATION */,
                    'included': platform_2.isWeb
                }
            }
        });
        // Zen Mode
        registry.registerConfiguration({
            'id': 'zenMode',
            'order': 9,
            'title': (0, nls_1.localize)(115, null),
            'type': 'object',
            'properties': {
                'zenMode.fullScreen': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(116, null)
                },
                'zenMode.centerLayout': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(117, null)
                },
                'zenMode.hideTabs': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(118, null)
                },
                'zenMode.hideStatusBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(119, null)
                },
                'zenMode.hideActivityBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(120, null)
                },
                'zenMode.hideLineNumbers': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(121, null)
                },
                'zenMode.restore': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(122, null)
                },
                'zenMode.silentNotifications': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(123, null)
                }
            }
        });
    })();
    let ExperimentalCustomHoverConfigContribution = class ExperimentalCustomHoverConfigContribution {
        constructor(tasExperimentService) {
            tasExperimentService.getTreatment('customHovers').then(useCustomHoversAsDefault => {
                registry.registerConfiguration(Object.assign(Object.assign({}, configuration_1.workbenchConfigurationNodeBase), { 'properties': {
                        'workbench.experimental.useCustomHover': {
                            'type': 'boolean',
                            'description': (0, nls_1.localize)(124, null),
                            'default': !!useCustomHoversAsDefault
                        }
                    } }));
            });
        }
    };
    ExperimentalCustomHoverConfigContribution = __decorate([
        __param(0, experimentService_1.ITASExperimentService)
    ], ExperimentalCustomHoverConfigContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExperimentalCustomHoverConfigContribution, 1 /* Starting */);
});
//# sourceMappingURL=workbench.contribution.js.map