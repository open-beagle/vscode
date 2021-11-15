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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/workbench/services/output/common/output", "vs/nls!vs/workbench/contrib/remote/common/remote.contribution", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/contrib/remote/common/tunnelFactory", "vs/workbench/contrib/remote/common/showCandidate", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, contributions_1, platform_1, label_1, platform_2, network_1, remoteAgentService_1, log_1, logIpc_1, output_1, nls_1, resources_1, lifecycle_1, tunnelFactory_1, showCandidate_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelContribution = void 0;
    let LabelContribution = class LabelContribution {
        constructor(labelService, remoteAgentService) {
            this.labelService = labelService;
            this.remoteAgentService = remoteAgentService;
            this.registerFormatters();
        }
        registerFormatters() {
            this.remoteAgentService.getEnvironment().then(remoteEnvironment => {
                const os = (remoteEnvironment === null || remoteEnvironment === void 0 ? void 0 : remoteEnvironment.os) || platform_2.OS;
                const formatting = {
                    label: '${path}',
                    separator: os === 1 /* Windows */ ? '\\' : '/',
                    tildify: os !== 1 /* Windows */,
                    normalizeDriveLetter: os === 1 /* Windows */,
                    workspaceSuffix: platform_2.isWeb ? undefined : network_1.Schemas.vscodeRemote
                };
                this.labelService.registerFormatter({
                    scheme: network_1.Schemas.vscodeRemote,
                    formatting
                });
                if (remoteEnvironment) {
                    this.labelService.registerFormatter({
                        scheme: network_1.Schemas.userData,
                        formatting
                    });
                }
            });
        }
    };
    LabelContribution = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, remoteAgentService_1.IRemoteAgentService)
    ], LabelContribution);
    exports.LabelContribution = LabelContribution;
    let RemoteChannelsContribution = class RemoteChannelsContribution extends lifecycle_1.Disposable {
        constructor(logService, remoteAgentService) {
            super();
            const updateRemoteLogLevel = () => {
                const connection = remoteAgentService.getConnection();
                if (!connection) {
                    return;
                }
                connection.withChannel('logger', (channel) => logIpc_1.LogLevelChannelClient.setLevel(channel, logService.getLevel()));
            };
            updateRemoteLogLevel();
            this._register(logService.onDidChangeLogLevel(updateRemoteLogLevel));
        }
    };
    RemoteChannelsContribution = __decorate([
        __param(0, log_1.ILogService),
        __param(1, remoteAgentService_1.IRemoteAgentService)
    ], RemoteChannelsContribution);
    let RemoteLogOutputChannels = class RemoteLogOutputChannels {
        constructor(remoteAgentService) {
            remoteAgentService.getEnvironment().then(remoteEnv => {
                if (remoteEnv) {
                    const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
                    outputChannelRegistry.registerChannel({ id: 'remoteExtensionLog', label: (0, nls_1.localize)(0, null), file: (0, resources_1.joinPath)(remoteEnv.logsPath, `${remoteAgentService_1.RemoteExtensionLogFileName}.log`), log: true });
                }
            });
        }
    };
    RemoteLogOutputChannels = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService)
    ], RemoteLogOutputChannels);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(LabelContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteLogOutputChannels, 3 /* Restored */);
    workbenchContributionsRegistry.registerWorkbenchContribution(tunnelFactory_1.TunnelFactoryContribution, 2 /* Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(showCandidate_1.ShowCandidateContribution, 2 /* Ready */);
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace',
            'web'
        ],
        enumDescriptions: [
            (0, nls_1.localize)(1, null),
            (0, nls_1.localize)(2, null),
            (0, nls_1.localize)(3, null)
        ],
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: (0, nls_1.localize)(4, null),
        type: 'object',
        properties: {
            'remote.extensionKind': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(5, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9\-A-Z]*)\\.([a-z0-9A-Z][a-z0-9\-A-Z]*)$': {
                        oneOf: [{ type: 'array', items: extensionKindSchema }, extensionKindSchema],
                        default: ['ui'],
                    },
                },
                default: {
                    'pub.name': ['ui']
                }
            },
            'remote.restoreForwardedPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(6, null),
                default: true
            },
            'remote.autoForwardPorts': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(7, null),
                default: true
            },
            'remote.autoForwardPortsSource': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(8, null),
                enum: ['process', 'output'],
                enumDescriptions: [
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null)
                ],
                default: 'process'
            },
            // Consider making changes to extensions\configuration-editing\schemas\devContainer.schema.src.json
            // and extensions\configuration-editing\schemas\attachContainer.schema.json
            // to keep in sync with devcontainer.json schema.
            'remote.portsAttributes': {
                type: 'object',
                patternProperties: {
                    '(^\\d+(\\-\\d+)?$)|(.+)': {
                        type: 'object',
                        description: (0, nls_1.localize)(11, null),
                        properties: {
                            'onAutoForward': {
                                type: 'string',
                                enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                                enumDescriptions: [
                                    (0, nls_1.localize)(12, null),
                                    (0, nls_1.localize)(13, null),
                                    (0, nls_1.localize)(14, null),
                                    (0, nls_1.localize)(15, null),
                                    (0, nls_1.localize)(16, null)
                                ],
                                description: (0, nls_1.localize)(17, null),
                                default: 'notify'
                            },
                            'elevateIfNeeded': {
                                type: 'boolean',
                                description: (0, nls_1.localize)(18, null),
                                default: false
                            },
                            'label': {
                                type: 'string',
                                description: (0, nls_1.localize)(19, null),
                                default: (0, nls_1.localize)(20, null)
                            }
                        },
                        default: {
                            'label': (0, nls_1.localize)(21, null),
                            'onAutoForward': 'notify'
                        }
                    }
                },
                markdownDescription: (0, nls_1.localize)(22, null),
                defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
                errorMessage: (0, nls_1.localize)(23, null),
                additionalProperties: false
            },
            'remote.otherPortsAttributes': {
                type: 'object',
                properties: {
                    'onAutoForward': {
                        type: 'string',
                        enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                        enumDescriptions: [
                            (0, nls_1.localize)(24, null),
                            (0, nls_1.localize)(25, null),
                            (0, nls_1.localize)(26, null),
                            (0, nls_1.localize)(27, null),
                            (0, nls_1.localize)(28, null)
                        ],
                        description: (0, nls_1.localize)(29, null),
                        default: 'notify'
                    },
                    'elevateIfNeeded': {
                        type: 'boolean',
                        description: (0, nls_1.localize)(30, null),
                        default: false
                    },
                    'label': {
                        type: 'string',
                        description: (0, nls_1.localize)(31, null),
                        default: (0, nls_1.localize)(32, null)
                    }
                },
                defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
                markdownDescription: (0, nls_1.localize)(33, null),
                additionalProperties: false
            }
        }
    });
});
//# sourceMappingURL=remote.contribution.js.map