/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/color", "vs/nls!vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugIcons"], function (require, exports, colorRegistry_1, themeService_1, color_1, nls_1, icons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColors = exports.debugIconStartForeground = exports.debugToolBarBorder = exports.debugToolBarBackground = void 0;
    exports.debugToolBarBackground = (0, colorRegistry_1.registerColor)('debugToolBar.background', {
        dark: '#333333',
        light: '#F3F3F3',
        hc: '#000000'
    }, (0, nls_1.localize)(0, null));
    exports.debugToolBarBorder = (0, colorRegistry_1.registerColor)('debugToolBar.border', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(1, null));
    exports.debugIconStartForeground = (0, colorRegistry_1.registerColor)('debugIcon.startForeground', {
        dark: '#89D185',
        light: '#388A34',
        hc: '#89D185'
    }, (0, nls_1.localize)(2, null));
    function registerColors() {
        const debugTokenExpressionName = (0, colorRegistry_1.registerColor)('debugTokenExpression.name', { dark: '#c586c0', light: '#9b46b0', hc: colorRegistry_1.foreground }, 'Foreground color for the token names shown in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionValue = (0, colorRegistry_1.registerColor)('debugTokenExpression.value', { dark: '#cccccc99', light: '#6c6c6ccc', hc: colorRegistry_1.foreground }, 'Foreground color for the token values shown in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionString = (0, colorRegistry_1.registerColor)('debugTokenExpression.string', { dark: '#ce9178', light: '#a31515', hc: '#f48771' }, 'Foreground color for strings in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionBoolean = (0, colorRegistry_1.registerColor)('debugTokenExpression.boolean', { dark: '#4e94ce', light: '#0000ff', hc: '#75bdfe' }, 'Foreground color for booleans in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionNumber = (0, colorRegistry_1.registerColor)('debugTokenExpression.number', { dark: '#b5cea8', light: '#098658', hc: '#89d185' }, 'Foreground color for numbers in the debug views (ie. the Variables or Watch view).');
        const debugTokenExpressionError = (0, colorRegistry_1.registerColor)('debugTokenExpression.error', { dark: '#f48771', light: '#e51400', hc: '#f48771' }, 'Foreground color for expression errors in the debug views (ie. the Variables or Watch view) and for error logs shown in the debug console.');
        const debugViewExceptionLabelForeground = (0, colorRegistry_1.registerColor)('debugView.exceptionLabelForeground', { dark: colorRegistry_1.foreground, light: '#FFF', hc: colorRegistry_1.foreground }, 'Foreground color for a label shown in the CALL STACK view when the debugger breaks on an exception.');
        const debugViewExceptionLabelBackground = (0, colorRegistry_1.registerColor)('debugView.exceptionLabelBackground', { dark: '#6C2022', light: '#A31515', hc: '#6C2022' }, 'Background color for a label shown in the CALL STACK view when the debugger breaks on an exception.');
        const debugViewStateLabelForeground = (0, colorRegistry_1.registerColor)('debugView.stateLabelForeground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hc: colorRegistry_1.foreground }, 'Foreground color for a label in the CALL STACK view showing the current session\'s or thread\'s state.');
        const debugViewStateLabelBackground = (0, colorRegistry_1.registerColor)('debugView.stateLabelBackground', { dark: '#88888844', light: '#88888844', hc: '#88888844' }, 'Background color for a label in the CALL STACK view showing the current session\'s or thread\'s state.');
        const debugViewValueChangedHighlight = (0, colorRegistry_1.registerColor)('debugView.valueChangedHighlight', { dark: '#569CD6', light: '#569CD6', hc: '#569CD6' }, 'Color used to highlight value changes in the debug views (ie. in the Variables view).');
        const debugConsoleInfoForeground = (0, colorRegistry_1.registerColor)('debugConsole.infoForeground', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hc: colorRegistry_1.foreground }, 'Foreground color for info messages in debug REPL console.');
        const debugConsoleWarningForeground = (0, colorRegistry_1.registerColor)('debugConsole.warningForeground', { dark: colorRegistry_1.editorWarningForeground, light: colorRegistry_1.editorWarningForeground, hc: '#008000' }, 'Foreground color for warning messages in debug REPL console.');
        const debugConsoleErrorForeground = (0, colorRegistry_1.registerColor)('debugConsole.errorForeground', { dark: colorRegistry_1.errorForeground, light: colorRegistry_1.errorForeground, hc: colorRegistry_1.errorForeground }, 'Foreground color for error messages in debug REPL console.');
        const debugConsoleSourceForeground = (0, colorRegistry_1.registerColor)('debugConsole.sourceForeground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hc: colorRegistry_1.foreground }, 'Foreground color for source filenames in debug REPL console.');
        const debugConsoleInputIconForeground = (0, colorRegistry_1.registerColor)('debugConsoleInputIcon.foreground', { dark: colorRegistry_1.foreground, light: colorRegistry_1.foreground, hc: colorRegistry_1.foreground }, 'Foreground color for debug console input marker icon.');
        const debugIconPauseForeground = (0, colorRegistry_1.registerColor)('debugIcon.pauseForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(3, null));
        const debugIconStopForeground = (0, colorRegistry_1.registerColor)('debugIcon.stopForeground', {
            dark: '#F48771',
            light: '#A1260D',
            hc: '#F48771'
        }, (0, nls_1.localize)(4, null));
        const debugIconDisconnectForeground = (0, colorRegistry_1.registerColor)('debugIcon.disconnectForeground', {
            dark: '#F48771',
            light: '#A1260D',
            hc: '#F48771'
        }, (0, nls_1.localize)(5, null));
        const debugIconRestartForeground = (0, colorRegistry_1.registerColor)('debugIcon.restartForeground', {
            dark: '#89D185',
            light: '#388A34',
            hc: '#89D185'
        }, (0, nls_1.localize)(6, null));
        const debugIconStepOverForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepOverForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(7, null));
        const debugIconStepIntoForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepIntoForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(8, null));
        const debugIconStepOutForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepOutForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(9, null));
        const debugIconContinueForeground = (0, colorRegistry_1.registerColor)('debugIcon.continueForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(10, null));
        const debugIconStepBackForeground = (0, colorRegistry_1.registerColor)('debugIcon.stepBackForeground', {
            dark: '#75BEFF',
            light: '#007ACC',
            hc: '#75BEFF'
        }, (0, nls_1.localize)(11, null));
        (0, themeService_1.registerThemingParticipant)((theme, collector) => {
            // All these colours provide a default value so they will never be undefined, hence the `!`
            const badgeBackgroundColor = theme.getColor(colorRegistry_1.badgeBackground);
            const badgeForegroundColor = theme.getColor(colorRegistry_1.badgeForeground);
            const listDeemphasizedForegroundColor = theme.getColor(colorRegistry_1.listDeemphasizedForeground);
            const debugViewExceptionLabelForegroundColor = theme.getColor(debugViewExceptionLabelForeground);
            const debugViewExceptionLabelBackgroundColor = theme.getColor(debugViewExceptionLabelBackground);
            const debugViewStateLabelForegroundColor = theme.getColor(debugViewStateLabelForeground);
            const debugViewStateLabelBackgroundColor = theme.getColor(debugViewStateLabelBackground);
            const debugViewValueChangedHighlightColor = theme.getColor(debugViewValueChangedHighlight);
            collector.addRule(`
			/* Text colour of the call stack row's filename */
			.debug-pane .debug-call-stack .monaco-list-row:not(.selected) .stack-frame > .file .file-name {
				color: ${listDeemphasizedForegroundColor}
			}

			/* Line & column number "badge" for selected call stack row */
			.debug-pane .monaco-list-row.selected .line-number {
				background-color: ${badgeBackgroundColor};
				color: ${badgeForegroundColor};
			}

			/* Line & column number "badge" for unselected call stack row (basically all other rows) */
			.debug-pane .line-number {
				background-color: ${badgeBackgroundColor.transparent(0.6)};
				color: ${badgeForegroundColor.transparent(0.6)};
			}

			/* State "badge" displaying the active session's current state.
			* Only visible when there are more active debug sessions/threads running.
			*/
			.debug-pane .debug-call-stack .thread > .state.label,
			.debug-pane .debug-call-stack .session > .state.label,
			.debug-pane .monaco-list-row.selected .thread > .state.label,
			.debug-pane .monaco-list-row.selected .session > .state.label {
				background-color: ${debugViewStateLabelBackgroundColor};
				color: ${debugViewStateLabelForegroundColor};
			}

			/* Info "badge" shown when the debugger pauses due to a thrown exception. */
			.debug-pane .debug-call-stack-title > .pause-message > .label.exception {
				background-color: ${debugViewExceptionLabelBackgroundColor};
				color: ${debugViewExceptionLabelForegroundColor};
			}

			/* Animation of changed values in Debug viewlet */
			@keyframes debugViewletValueChanged {
				0%   { background-color: ${debugViewValueChangedHighlightColor.transparent(0)} }
				5%   { background-color: ${debugViewValueChangedHighlightColor.transparent(0.9)} }
				100% { background-color: ${debugViewValueChangedHighlightColor.transparent(0.3)} }
			}

			.debug-pane .monaco-list-row .expression .value.changed {
				background-color: ${debugViewValueChangedHighlightColor.transparent(0.3)};
				animation-name: debugViewletValueChanged;
				animation-duration: 1s;
				animation-fill-mode: forwards;
			}
		`);
            const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
            if (contrastBorderColor) {
                collector.addRule(`
			.debug-pane .line-number {
				border: 1px solid ${contrastBorderColor};
			}
			`);
            }
            const tokenNameColor = theme.getColor(debugTokenExpressionName);
            const tokenValueColor = theme.getColor(debugTokenExpressionValue);
            const tokenStringColor = theme.getColor(debugTokenExpressionString);
            const tokenBooleanColor = theme.getColor(debugTokenExpressionBoolean);
            const tokenErrorColor = theme.getColor(debugTokenExpressionError);
            const tokenNumberColor = theme.getColor(debugTokenExpressionNumber);
            collector.addRule(`
			.monaco-workbench .monaco-list-row .expression .name {
				color: ${tokenNameColor};
			}

			.monaco-workbench .monaco-list-row .expression .value,
			.monaco-workbench .debug-hover-widget .value {
				color: ${tokenValueColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.string,
			.monaco-workbench .debug-hover-widget .value.string {
				color: ${tokenStringColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.boolean,
			.monaco-workbench .debug-hover-widget .value.boolean {
				color: ${tokenBooleanColor};
			}

			.monaco-workbench .monaco-list-row .expression .error,
			.monaco-workbench .debug-hover-widget .error,
			.monaco-workbench .debug-pane .debug-variables .scope .error {
				color: ${tokenErrorColor};
			}

			.monaco-workbench .monaco-list-row .expression .value.number,
			.monaco-workbench .debug-hover-widget .value.number {
				color: ${tokenNumberColor};
			}
		`);
            const debugConsoleInputBorderColor = theme.getColor(colorRegistry_1.inputBorder) || color_1.Color.fromHex('#80808060');
            const debugConsoleInfoForegroundColor = theme.getColor(debugConsoleInfoForeground);
            const debugConsoleWarningForegroundColor = theme.getColor(debugConsoleWarningForeground);
            const debugConsoleErrorForegroundColor = theme.getColor(debugConsoleErrorForeground);
            const debugConsoleSourceForegroundColor = theme.getColor(debugConsoleSourceForeground);
            const debugConsoleInputIconForegroundColor = theme.getColor(debugConsoleInputIconForeground);
            collector.addRule(`
			.repl .repl-input-wrapper {
				border-top: 1px solid ${debugConsoleInputBorderColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.info {
				color: ${debugConsoleInfoForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.warn {
				color: ${debugConsoleWarningForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .value.error {
				color: ${debugConsoleErrorForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .output .expression .source {
				color: ${debugConsoleSourceForegroundColor};
			}

			.monaco-workbench .repl .repl-tree .monaco-tl-contents .arrow {
				color: ${debugConsoleInputIconForegroundColor};
			}
		`);
            if (!theme.defines(debugConsoleInputIconForeground)) {
                collector.addRule(`
				.monaco-workbench.vs .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.25;
				}

				.monaco-workbench.vs-dark .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 0.4;
				}

				.monaco-workbench.hc-black .repl .repl-tree .monaco-tl-contents .arrow {
					opacity: 1;
				}
			`);
            }
            const debugIconStartColor = theme.getColor(exports.debugIconStartForeground);
            if (debugIconStartColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStart)} { color: ${debugIconStartColor} !important; }`);
            }
            const debugIconPauseColor = theme.getColor(debugIconPauseForeground);
            if (debugIconPauseColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugPause)} { color: ${debugIconPauseColor} !important; }`);
            }
            const debugIconStopColor = theme.getColor(debugIconStopForeground);
            if (debugIconStopColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStop)} { color: ${debugIconStopColor} !important; }`);
            }
            const debugIconDisconnectColor = theme.getColor(debugIconDisconnectForeground);
            if (debugIconDisconnectColor) {
                collector.addRule(`.monaco-workbench .debug-view-content ${themeService_1.ThemeIcon.asCSSSelector(icons.debugDisconnect)}, .monaco-workbench .debug-toolbar ${themeService_1.ThemeIcon.asCSSSelector(icons.debugDisconnect)} { color: ${debugIconDisconnectColor} !important; }`);
            }
            const debugIconRestartColor = theme.getColor(debugIconRestartForeground);
            if (debugIconRestartColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugRestart)}, .monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugRestartFrame)} { color: ${debugIconRestartColor} !important; }`);
            }
            const debugIconStepOverColor = theme.getColor(debugIconStepOverForeground);
            if (debugIconStepOverColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStepOver)} { color: ${debugIconStepOverColor} !important; }`);
            }
            const debugIconStepIntoColor = theme.getColor(debugIconStepIntoForeground);
            if (debugIconStepIntoColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStepInto)} { color: ${debugIconStepIntoColor} !important; }`);
            }
            const debugIconStepOutColor = theme.getColor(debugIconStepOutForeground);
            if (debugIconStepOutColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStepOut)} { color: ${debugIconStepOutColor} !important; }`);
            }
            const debugIconContinueColor = theme.getColor(debugIconContinueForeground);
            if (debugIconContinueColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugContinue)}, .monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugReverseContinue)} { color: ${debugIconContinueColor} !important; }`);
            }
            const debugIconStepBackColor = theme.getColor(debugIconStepBackForeground);
            if (debugIconStepBackColor) {
                collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(icons.debugStepBack)} { color: ${debugIconStepBackColor} !important; }`);
            }
        });
    }
    exports.registerColors = registerColors;
});
//# sourceMappingURL=debugColors.js.map