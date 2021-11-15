/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color", "vs/nls!vs/workbench/contrib/testing/browser/theme", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/api/common/extHostTypes", "vs/workbench/common/theme"], function (require, exports, color_1, nls_1, colorRegistry_1, themeService_1, extHostTypes_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testStatesToIconColors = exports.testMessageSeverityColors = exports.testingPeekBorder = exports.testingColorIconSkipped = exports.testingColorIconUnset = exports.testingColorIconQueued = exports.testingColorRunAction = exports.testingColorIconPassed = exports.testingColorIconErrored = exports.testingColorIconFailed = void 0;
    exports.testingColorIconFailed = (0, colorRegistry_1.registerColor)('testing.iconFailed', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hc: '#000000'
    }, (0, nls_1.localize)(0, null));
    exports.testingColorIconErrored = (0, colorRegistry_1.registerColor)('testing.iconErrored', {
        dark: '#f14c4c',
        light: '#f14c4c',
        hc: '#000000'
    }, (0, nls_1.localize)(1, null));
    exports.testingColorIconPassed = (0, colorRegistry_1.registerColor)('testing.iconPassed', {
        dark: '#73c991',
        light: '#73c991',
        hc: '#000000'
    }, (0, nls_1.localize)(2, null));
    exports.testingColorRunAction = (0, colorRegistry_1.registerColor)('testing.runAction', {
        dark: exports.testingColorIconPassed,
        light: exports.testingColorIconPassed,
        hc: exports.testingColorIconPassed
    }, (0, nls_1.localize)(3, null));
    exports.testingColorIconQueued = (0, colorRegistry_1.registerColor)('testing.iconQueued', {
        dark: '#cca700',
        light: '#cca700',
        hc: '#000000'
    }, (0, nls_1.localize)(4, null));
    exports.testingColorIconUnset = (0, colorRegistry_1.registerColor)('testing.iconUnset', {
        dark: '#848484',
        light: '#848484',
        hc: '#848484'
    }, (0, nls_1.localize)(5, null));
    exports.testingColorIconSkipped = (0, colorRegistry_1.registerColor)('testing.iconSkipped', {
        dark: '#848484',
        light: '#848484',
        hc: '#848484'
    }, (0, nls_1.localize)(6, null));
    exports.testingPeekBorder = (0, colorRegistry_1.registerColor)('testing.peekBorder', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hc: colorRegistry_1.editorErrorForeground,
    }, (0, nls_1.localize)(7, null));
    exports.testMessageSeverityColors = {
        [extHostTypes_1.TestMessageSeverity.Error]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.error.decorationForeground', { dark: colorRegistry_1.editorErrorForeground, light: colorRegistry_1.editorErrorForeground, hc: colorRegistry_1.editorForeground }, (0, nls_1.localize)(8, null)),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.error.lineBackground', { dark: new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2)), light: new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2)), hc: null }, (0, nls_1.localize)(9, null)),
        },
        [extHostTypes_1.TestMessageSeverity.Warning]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.warning.decorationForeground', { dark: colorRegistry_1.editorWarningForeground, light: colorRegistry_1.editorWarningForeground, hc: colorRegistry_1.editorForeground }, (0, nls_1.localize)(10, null)),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.warning.lineBackground', { dark: new color_1.Color(new color_1.RGBA(255, 208, 0, 0.2)), light: new color_1.Color(new color_1.RGBA(255, 208, 0, 0.2)), hc: null }, (0, nls_1.localize)(11, null)),
        },
        [extHostTypes_1.TestMessageSeverity.Information]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.info.decorationForeground', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hc: colorRegistry_1.editorForeground }, (0, nls_1.localize)(12, null)),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.info.lineBackground', { dark: new color_1.Color(new color_1.RGBA(0, 127, 255, 0.2)), light: new color_1.Color(new color_1.RGBA(0, 127, 255, 0.2)), hc: null }, (0, nls_1.localize)(13, null)),
        },
        [extHostTypes_1.TestMessageSeverity.Hint]: {
            decorationForeground: (0, colorRegistry_1.registerColor)('testing.message.hint.decorationForeground', { dark: colorRegistry_1.editorHintForeground, light: colorRegistry_1.editorHintForeground, hc: colorRegistry_1.editorForeground }, (0, nls_1.localize)(14, null)),
            marginBackground: (0, colorRegistry_1.registerColor)('testing.message.hint.lineBackground', { dark: null, light: null, hc: colorRegistry_1.editorForeground }, (0, nls_1.localize)(15, null)),
        },
    };
    exports.testStatesToIconColors = {
        [extHostTypes_1.TestResultState.Errored]: exports.testingColorIconErrored,
        [extHostTypes_1.TestResultState.Failed]: exports.testingColorIconFailed,
        [extHostTypes_1.TestResultState.Passed]: exports.testingColorIconPassed,
        [extHostTypes_1.TestResultState.Queued]: exports.testingColorIconQueued,
        [extHostTypes_1.TestResultState.Unset]: exports.testingColorIconUnset,
        [extHostTypes_1.TestResultState.Skipped]: exports.testingColorIconUnset,
    };
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        //#region test states
        for (const [state, { marginBackground }] of Object.entries(exports.testMessageSeverityColors)) {
            collector.addRule(`.monaco-editor .testing-inline-message-severity-${state} {
			background: ${theme.getColor(marginBackground)};
		}`);
        }
        //#endregion test states
        //#region active buttons
        const inputActiveOptionBorderColor = theme.getColor(colorRegistry_1.inputActiveOptionBorder);
        if (inputActiveOptionBorderColor) {
            collector.addRule(`.testing-filter-action-item > .monaco-action-bar .testing-filter-button.checked { border-color: ${inputActiveOptionBorderColor}; }`);
        }
        const inputActiveOptionForegroundColor = theme.getColor(colorRegistry_1.inputActiveOptionForeground);
        if (inputActiveOptionForegroundColor) {
            collector.addRule(`.testing-filter-action-item > .monaco-action-bar .testing-filter-button.checked { color: ${inputActiveOptionForegroundColor}; }`);
        }
        const inputActiveOptionBackgroundColor = theme.getColor(colorRegistry_1.inputActiveOptionBackground);
        if (inputActiveOptionBackgroundColor) {
            collector.addRule(`.testing-filter-action-item > .monaco-action-bar .testing-filter-button.checked { background-color: ${inputActiveOptionBackgroundColor}; }`);
        }
        const badgeColor = theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND);
        collector.addRule(`.monaco-workbench .part > .title > .title-actions .action-label.codicon-testing-autorun::after { background-color: ${badgeColor}; }`);
        //#endregion
    });
});
//# sourceMappingURL=theme.js.map