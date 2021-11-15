/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/sash/browser/sash.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/common/configuration", "vs/workbench/common/contributions", "vs/workbench/contrib/sash/browser/sash", "vs/base/browser/browser", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, configurationRegistry_1, platform_1, configuration_1, contributions_1, sash_1, browser_1, themeService_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Sash size contribution
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(sash_1.SashSettingsController, 3 /* Restored */);
    // Sash size configuration contribution
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration(Object.assign(Object.assign({}, configuration_1.workbenchConfigurationNodeBase), { properties: {
            'workbench.sash.size': {
                type: 'number',
                default: browser_1.isIPad ? 20 : 4,
                minimum: 1,
                maximum: 20,
                description: (0, nls_1.localize)(0, null)
            },
            'workbench.sash.hoverDelay': {
                type: 'number',
                default: 300,
                minimum: 0,
                maximum: 2000,
                description: (0, nls_1.localize)(1, null)
            },
        } }));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const sashHoverBorderColor = theme.getColor(colorRegistry_1.sashHoverBorder);
        collector.addRule(`
		.monaco-sash.hover:before,
		.monaco-sash.active:before {
			background: ${sashHoverBorderColor};
		}
	`);
    });
});
//# sourceMappingURL=sash.contribution.js.map