/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/nls!vs/platform/update/common/update.config.contribution", "vs/base/common/platform"], function (require, exports, platform_1, configurationRegistry_1, nls_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'update',
        order: 15,
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            'update.mode': {
                type: 'string',
                enum: ['none', 'manual', 'start', 'default'],
                default: 'default',
                scope: 1 /* APPLICATION */,
                description: (0, nls_1.localize)(1, null),
                tags: ['usesOnlineServices'],
                enumDescriptions: [
                    (0, nls_1.localize)(2, null),
                    (0, nls_1.localize)(3, null),
                    (0, nls_1.localize)(4, null),
                    (0, nls_1.localize)(5, null)
                ]
            },
            'update.channel': {
                type: 'string',
                default: 'default',
                scope: 1 /* APPLICATION */,
                description: (0, nls_1.localize)(6, null),
                deprecationMessage: (0, nls_1.localize)(7, null, 'update.mode')
            },
            'update.enableWindowsBackgroundUpdates': {
                type: 'boolean',
                default: true,
                scope: 1 /* APPLICATION */,
                title: (0, nls_1.localize)(8, null),
                description: (0, nls_1.localize)(9, null),
                included: platform_2.isWindows && !platform_2.isWeb
            },
            'update.showReleaseNotes': {
                type: 'boolean',
                default: true,
                scope: 1 /* APPLICATION */,
                description: (0, nls_1.localize)(10, null),
                tags: ['usesOnlineServices']
            }
        }
    });
});
//# sourceMappingURL=update.config.contribution.js.map