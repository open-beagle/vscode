/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/testing/browser/icons", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/browser/theme"], function (require, exports, codicons_1, nls_1, iconRegistry_1, themeService_1, extHostTypes_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testingStatesToIcons = exports.testingShowAsTree = exports.testingShowAsList = exports.testingHiddenIcon = exports.testingAutorunIcon = exports.testingFilterIcon = exports.testingCancelIcon = exports.testingDebugIcon = exports.testingRunAllIcon = exports.testingRunIcon = exports.testingViewIcon = void 0;
    exports.testingViewIcon = (0, iconRegistry_1.registerIcon)('test-view-icon', codicons_1.Codicon.beaker, (0, nls_1.localize)(0, null));
    exports.testingRunIcon = (0, iconRegistry_1.registerIcon)('testing-run-icon', codicons_1.Codicon.run, (0, nls_1.localize)(1, null));
    exports.testingRunAllIcon = (0, iconRegistry_1.registerIcon)('testing-run-all-icon', codicons_1.Codicon.runAll, (0, nls_1.localize)(2, null));
    exports.testingDebugIcon = (0, iconRegistry_1.registerIcon)('testing-debug-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(3, null));
    exports.testingCancelIcon = (0, iconRegistry_1.registerIcon)('testing-cancel-icon', codicons_1.Codicon.close, (0, nls_1.localize)(4, null));
    exports.testingFilterIcon = (0, iconRegistry_1.registerIcon)('testing-filter', codicons_1.Codicon.filter, (0, nls_1.localize)(5, null));
    exports.testingAutorunIcon = (0, iconRegistry_1.registerIcon)('testing-autorun', codicons_1.Codicon.debugRerun, (0, nls_1.localize)(6, null));
    exports.testingHiddenIcon = (0, iconRegistry_1.registerIcon)('testing-hidden', codicons_1.Codicon.eyeClosed, (0, nls_1.localize)(7, null));
    exports.testingShowAsList = (0, iconRegistry_1.registerIcon)('testing-show-as-list-icon', codicons_1.Codicon.listTree, (0, nls_1.localize)(8, null));
    exports.testingShowAsTree = (0, iconRegistry_1.registerIcon)('testing-show-as-list-icon', codicons_1.Codicon.listFlat, (0, nls_1.localize)(9, null));
    exports.testingStatesToIcons = new Map([
        [extHostTypes_1.TestResultState.Errored, (0, iconRegistry_1.registerIcon)('testing-error-icon', codicons_1.Codicon.issues, (0, nls_1.localize)(10, null))],
        [extHostTypes_1.TestResultState.Failed, (0, iconRegistry_1.registerIcon)('testing-failed-icon', codicons_1.Codicon.error, (0, nls_1.localize)(11, null))],
        [extHostTypes_1.TestResultState.Passed, (0, iconRegistry_1.registerIcon)('testing-passed-icon', codicons_1.Codicon.pass, (0, nls_1.localize)(12, null))],
        [extHostTypes_1.TestResultState.Queued, (0, iconRegistry_1.registerIcon)('testing-queued-icon', codicons_1.Codicon.history, (0, nls_1.localize)(13, null))],
        [extHostTypes_1.TestResultState.Running, themeService_1.ThemeIcon.modify(codicons_1.Codicon.loading, 'spin')],
        [extHostTypes_1.TestResultState.Skipped, (0, iconRegistry_1.registerIcon)('testing-skipped-icon', codicons_1.Codicon.debugStepOver, (0, nls_1.localize)(14, null))],
        [extHostTypes_1.TestResultState.Unset, (0, iconRegistry_1.registerIcon)('testing-unset-icon', codicons_1.Codicon.circleOutline, (0, nls_1.localize)(15, null))],
    ]);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        for (const [state, icon] of exports.testingStatesToIcons.entries()) {
            const color = theme_1.testStatesToIconColors[state];
            if (!color) {
                continue;
            }
            collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icon)} {
			color: ${theme.getColor(color)} !important;
		}`);
        }
        collector.addRule(`
		.monaco-editor ${themeService_1.ThemeIcon.asCSSSelector(exports.testingRunIcon)},
		.monaco-editor ${themeService_1.ThemeIcon.asCSSSelector(exports.testingRunAllIcon)} {
			color: ${theme.getColor(theme_1.testingColorRunAction)};
		}
	`);
    });
});
//# sourceMappingURL=icons.js.map