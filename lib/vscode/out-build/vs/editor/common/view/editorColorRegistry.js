/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/view/editorColorRegistry", "vs/base/common/color", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService"], function (require, exports, nls, color_1, colorRegistry_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.overviewRulerInfo = exports.overviewRulerWarning = exports.overviewRulerError = exports.overviewRulerRangeHighlight = exports.editorUnnecessaryCodeOpacity = exports.editorUnnecessaryCodeBorder = exports.editorGutter = exports.editorOverviewRulerBackground = exports.editorOverviewRulerBorder = exports.editorBracketMatchBorder = exports.editorBracketMatchBackground = exports.editorCodeLensForeground = exports.editorRuler = exports.editorActiveLineNumber = exports.editorLineNumbers = exports.editorActiveIndentGuides = exports.editorIndentGuides = exports.editorWhitespaces = exports.editorCursorBackground = exports.editorCursorForeground = exports.editorSymbolHighlightBorder = exports.editorSymbolHighlight = exports.editorRangeHighlightBorder = exports.editorRangeHighlight = exports.editorLineHighlightBorder = exports.editorLineHighlight = void 0;
    /**
     * Definition of the editor colors
     */
    exports.editorLineHighlight = (0, colorRegistry_1.registerColor)('editor.lineHighlightBackground', { dark: null, light: null, hc: null }, nls.localize(0, null));
    exports.editorLineHighlightBorder = (0, colorRegistry_1.registerColor)('editor.lineHighlightBorder', { dark: '#282828', light: '#eeeeee', hc: '#f38518' }, nls.localize(1, null));
    exports.editorRangeHighlight = (0, colorRegistry_1.registerColor)('editor.rangeHighlightBackground', { dark: '#ffffff0b', light: '#fdff0033', hc: null }, nls.localize(2, null), true);
    exports.editorRangeHighlightBorder = (0, colorRegistry_1.registerColor)('editor.rangeHighlightBorder', { dark: null, light: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize(3, null), true);
    exports.editorSymbolHighlight = (0, colorRegistry_1.registerColor)('editor.symbolHighlightBackground', { dark: colorRegistry_1.editorFindMatchHighlight, light: colorRegistry_1.editorFindMatchHighlight, hc: null }, nls.localize(4, null), true);
    exports.editorSymbolHighlightBorder = (0, colorRegistry_1.registerColor)('editor.symbolHighlightBorder', { dark: null, light: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize(5, null), true);
    exports.editorCursorForeground = (0, colorRegistry_1.registerColor)('editorCursor.foreground', { dark: '#AEAFAD', light: color_1.Color.black, hc: color_1.Color.white }, nls.localize(6, null));
    exports.editorCursorBackground = (0, colorRegistry_1.registerColor)('editorCursor.background', null, nls.localize(7, null));
    exports.editorWhitespaces = (0, colorRegistry_1.registerColor)('editorWhitespace.foreground', { dark: '#e3e4e229', light: '#33333333', hc: '#e3e4e229' }, nls.localize(8, null));
    exports.editorIndentGuides = (0, colorRegistry_1.registerColor)('editorIndentGuide.background', { dark: exports.editorWhitespaces, light: exports.editorWhitespaces, hc: exports.editorWhitespaces }, nls.localize(9, null));
    exports.editorActiveIndentGuides = (0, colorRegistry_1.registerColor)('editorIndentGuide.activeBackground', { dark: exports.editorWhitespaces, light: exports.editorWhitespaces, hc: exports.editorWhitespaces }, nls.localize(10, null));
    exports.editorLineNumbers = (0, colorRegistry_1.registerColor)('editorLineNumber.foreground', { dark: '#858585', light: '#237893', hc: color_1.Color.white }, nls.localize(11, null));
    const deprecatedEditorActiveLineNumber = (0, colorRegistry_1.registerColor)('editorActiveLineNumber.foreground', { dark: '#c6c6c6', light: '#0B216F', hc: colorRegistry_1.activeContrastBorder }, nls.localize(12, null), false, nls.localize(13, null));
    exports.editorActiveLineNumber = (0, colorRegistry_1.registerColor)('editorLineNumber.activeForeground', { dark: deprecatedEditorActiveLineNumber, light: deprecatedEditorActiveLineNumber, hc: deprecatedEditorActiveLineNumber }, nls.localize(14, null));
    exports.editorRuler = (0, colorRegistry_1.registerColor)('editorRuler.foreground', { dark: '#5A5A5A', light: color_1.Color.lightgrey, hc: color_1.Color.white }, nls.localize(15, null));
    exports.editorCodeLensForeground = (0, colorRegistry_1.registerColor)('editorCodeLens.foreground', { dark: '#999999', light: '#999999', hc: '#999999' }, nls.localize(16, null));
    exports.editorBracketMatchBackground = (0, colorRegistry_1.registerColor)('editorBracketMatch.background', { dark: '#0064001a', light: '#0064001a', hc: '#0064001a' }, nls.localize(17, null));
    exports.editorBracketMatchBorder = (0, colorRegistry_1.registerColor)('editorBracketMatch.border', { dark: '#888', light: '#B9B9B9', hc: colorRegistry_1.contrastBorder }, nls.localize(18, null));
    exports.editorOverviewRulerBorder = (0, colorRegistry_1.registerColor)('editorOverviewRuler.border', { dark: '#7f7f7f4d', light: '#7f7f7f4d', hc: '#7f7f7f4d' }, nls.localize(19, null));
    exports.editorOverviewRulerBackground = (0, colorRegistry_1.registerColor)('editorOverviewRuler.background', null, nls.localize(20, null));
    exports.editorGutter = (0, colorRegistry_1.registerColor)('editorGutter.background', { dark: colorRegistry_1.editorBackground, light: colorRegistry_1.editorBackground, hc: colorRegistry_1.editorBackground }, nls.localize(21, null));
    exports.editorUnnecessaryCodeBorder = (0, colorRegistry_1.registerColor)('editorUnnecessaryCode.border', { dark: null, light: null, hc: color_1.Color.fromHex('#fff').transparent(0.8) }, nls.localize(22, null));
    exports.editorUnnecessaryCodeOpacity = (0, colorRegistry_1.registerColor)('editorUnnecessaryCode.opacity', { dark: color_1.Color.fromHex('#000a'), light: color_1.Color.fromHex('#0007'), hc: null }, nls.localize(23, null));
    const rulerRangeDefault = new color_1.Color(new color_1.RGBA(0, 122, 204, 0.6));
    exports.overviewRulerRangeHighlight = (0, colorRegistry_1.registerColor)('editorOverviewRuler.rangeHighlightForeground', { dark: rulerRangeDefault, light: rulerRangeDefault, hc: rulerRangeDefault }, nls.localize(24, null), true);
    exports.overviewRulerError = (0, colorRegistry_1.registerColor)('editorOverviewRuler.errorForeground', { dark: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), light: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), hc: new color_1.Color(new color_1.RGBA(255, 50, 50, 1)) }, nls.localize(25, null));
    exports.overviewRulerWarning = (0, colorRegistry_1.registerColor)('editorOverviewRuler.warningForeground', { dark: colorRegistry_1.editorWarningForeground, light: colorRegistry_1.editorWarningForeground, hc: colorRegistry_1.editorWarningBorder }, nls.localize(26, null));
    exports.overviewRulerInfo = (0, colorRegistry_1.registerColor)('editorOverviewRuler.infoForeground', { dark: colorRegistry_1.editorInfoForeground, light: colorRegistry_1.editorInfoForeground, hc: colorRegistry_1.editorInfoBorder }, nls.localize(27, null));
    // contains all color rules that used to defined in editor/browser/widget/editor.css
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const background = theme.getColor(colorRegistry_1.editorBackground);
        if (background) {
            collector.addRule(`.monaco-editor, .monaco-editor-background, .monaco-editor .inputarea.ime-input { background-color: ${background}; }`);
        }
        const foreground = theme.getColor(colorRegistry_1.editorForeground);
        if (foreground) {
            collector.addRule(`.monaco-editor, .monaco-editor .inputarea.ime-input { color: ${foreground}; }`);
        }
        const gutter = theme.getColor(exports.editorGutter);
        if (gutter) {
            collector.addRule(`.monaco-editor .margin { background-color: ${gutter}; }`);
        }
        const rangeHighlight = theme.getColor(exports.editorRangeHighlight);
        if (rangeHighlight) {
            collector.addRule(`.monaco-editor .rangeHighlight { background-color: ${rangeHighlight}; }`);
        }
        const rangeHighlightBorder = theme.getColor(exports.editorRangeHighlightBorder);
        if (rangeHighlightBorder) {
            collector.addRule(`.monaco-editor .rangeHighlight { border: 1px ${theme.type === 'hc' ? 'dotted' : 'solid'} ${rangeHighlightBorder}; }`);
        }
        const symbolHighlight = theme.getColor(exports.editorSymbolHighlight);
        if (symbolHighlight) {
            collector.addRule(`.monaco-editor .symbolHighlight { background-color: ${symbolHighlight}; }`);
        }
        const symbolHighlightBorder = theme.getColor(exports.editorSymbolHighlightBorder);
        if (symbolHighlightBorder) {
            collector.addRule(`.monaco-editor .symbolHighlight { border: 1px ${theme.type === 'hc' ? 'dotted' : 'solid'} ${symbolHighlightBorder}; }`);
        }
        const invisibles = theme.getColor(exports.editorWhitespaces);
        if (invisibles) {
            collector.addRule(`.monaco-editor .mtkw { color: ${invisibles} !important; }`);
            collector.addRule(`.monaco-editor .mtkz { color: ${invisibles} !important; }`);
        }
    });
});
//# sourceMappingURL=editorColorRegistry.js.map