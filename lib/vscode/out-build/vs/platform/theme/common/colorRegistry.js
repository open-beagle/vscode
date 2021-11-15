/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/base/common/color", "vs/base/common/event", "vs/nls!vs/platform/theme/common/colorRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/async"], function (require, exports, platform, color_1, event_1, nls, jsonContributionRegistry_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workbenchColorsSchemaId = exports.resolveColorValue = exports.oneOf = exports.transparent = exports.lighten = exports.darken = exports.chartsPurple = exports.chartsGreen = exports.chartsOrange = exports.chartsYellow = exports.chartsBlue = exports.chartsRed = exports.chartsLines = exports.chartsForeground = exports.problemsInfoIconForeground = exports.problemsWarningIconForeground = exports.problemsErrorIconForeground = exports.minimapSliderActiveBackground = exports.minimapSliderHoverBackground = exports.minimapSliderBackground = exports.minimapBackground = exports.minimapWarning = exports.minimapError = exports.minimapSelection = exports.minimapFindMatch = exports.overviewRulerSelectionHighlightForeground = exports.overviewRulerFindMatchForeground = exports.overviewRulerCommonContentForeground = exports.overviewRulerIncomingContentForeground = exports.overviewRulerCurrentContentForeground = exports.mergeBorder = exports.mergeCommonContentBackground = exports.mergeCommonHeaderBackground = exports.mergeIncomingContentBackground = exports.mergeIncomingHeaderBackground = exports.mergeCurrentContentBackground = exports.mergeCurrentHeaderBackground = exports.breadcrumbsPickerBackground = exports.breadcrumbsActiveSelectionForeground = exports.breadcrumbsFocusForeground = exports.breadcrumbsBackground = exports.breadcrumbsForeground = exports.snippetFinalTabstopHighlightBorder = exports.snippetFinalTabstopHighlightBackground = exports.snippetTabstopHighlightBorder = exports.snippetTabstopHighlightBackground = exports.toolbarActiveBackground = exports.toolbarHoverOutline = exports.toolbarHoverBackground = exports.menuSeparatorBackground = exports.menuSelectionBorder = exports.menuSelectionBackground = exports.menuSelectionForeground = exports.menuBackground = exports.menuForeground = exports.menuBorder = exports.quickInputListFocusBackground = exports._deprecatedQuickInputListFocusBackground = exports.listDeemphasizedForeground = exports.tableColumnsBorder = exports.treeIndentGuidesStroke = exports.listFilterMatchHighlightBorder = exports.listFilterMatchHighlight = exports.listFilterWidgetNoMatchesOutline = exports.listFilterWidgetOutline = exports.listFilterWidgetBackground = exports.listWarningForeground = exports.listErrorForeground = exports.listInvalidItemForeground = exports.listHighlightForeground = exports.listDropBackground = exports.listHoverForeground = exports.listHoverBackground = exports.listInactiveFocusOutline = exports.listInactiveFocusBackground = exports.listInactiveSelectionForeground = exports.listInactiveSelectionBackground = exports.listActiveSelectionForeground = exports.listActiveSelectionBackground = exports.listFocusOutline = exports.listFocusForeground = exports.listFocusBackground = exports.diffDiagonalFill = exports.diffBorder = exports.diffRemovedOutline = exports.diffInsertedOutline = exports.diffRemoved = exports.diffInserted = exports.defaultRemoveColor = exports.defaultInsertColor = exports.editorLightBulbAutoFixForeground = exports.editorLightBulbForeground = exports.editorInlineHintBackground = exports.editorInlineHintForeground = exports.editorActiveLinkForeground = exports.editorHoverStatusBarBackground = exports.editorHoverBorder = exports.editorHoverForeground = exports.editorHoverBackground = exports.editorHoverHighlight = exports.searchEditorFindMatchBorder = exports.searchEditorFindMatch = exports.editorFindRangeHighlightBorder = exports.editorFindMatchHighlightBorder = exports.editorFindMatchBorder = exports.editorFindRangeHighlight = exports.editorFindMatchHighlight = exports.editorFindMatch = exports.editorSelectionHighlightBorder = exports.editorSelectionHighlight = exports.editorInactiveSelection = exports.editorSelectionForeground = exports.editorSelectionBackground = exports.keybindingLabelBottomBorder = exports.keybindingLabelBorder = exports.keybindingLabelForeground = exports.keybindingLabelBackground = exports.pickerGroupBorder = exports.pickerGroupForeground = exports.quickInputTitleBackground = exports.quickInputForeground = exports.quickInputBackground = exports.editorWidgetResizeBorder = exports.editorWidgetBorder = exports.editorWidgetForeground = exports.editorWidgetBackground = exports.editorForeground = exports.editorBackground = exports.sashHoverBorder = exports.editorHintBorder = exports.editorHintForeground = exports.editorInfoBorder = exports.editorInfoForeground = exports.editorInfoBackground = exports.editorWarningBorder = exports.editorWarningForeground = exports.editorWarningBackground = exports.editorErrorBorder = exports.editorErrorForeground = exports.editorErrorBackground = exports.progressBarBackground = exports.scrollbarSliderActiveBackground = exports.scrollbarSliderHoverBackground = exports.scrollbarSliderBackground = exports.scrollbarShadow = exports.badgeForeground = exports.badgeBackground = exports.buttonSecondaryHoverBackground = exports.buttonSecondaryBackground = exports.buttonSecondaryForeground = exports.buttonBorder = exports.buttonHoverBackground = exports.buttonBackground = exports.buttonForeground = exports.simpleCheckboxBorder = exports.simpleCheckboxForeground = exports.simpleCheckboxBackground = exports.selectBorder = exports.selectForeground = exports.selectListBackground = exports.selectBackground = exports.inputValidationErrorBorder = exports.inputValidationErrorForeground = exports.inputValidationErrorBackground = exports.inputValidationWarningBorder = exports.inputValidationWarningForeground = exports.inputValidationWarningBackground = exports.inputValidationInfoBorder = exports.inputValidationInfoForeground = exports.inputValidationInfoBackground = exports.inputPlaceholderForeground = exports.inputActiveOptionForeground = exports.inputActiveOptionBackground = exports.inputActiveOptionBorder = exports.inputBorder = exports.inputForeground = exports.inputBackground = exports.widgetShadow = exports.textCodeBlockBackground = exports.textBlockQuoteBorder = exports.textBlockQuoteBackground = exports.textPreformatForeground = exports.textLinkActiveForeground = exports.textLinkForeground = exports.textSeparatorForeground = exports.selectionBackground = exports.activeContrastBorder = exports.contrastBorder = exports.focusBorder = exports.iconForeground = exports.descriptionForeground = exports.errorForeground = exports.foreground = exports.getColorRegistry = exports.registerColor = exports.Extensions = void 0;
    // color registry
    exports.Extensions = {
        ColorContribution: 'base.contributions.colors'
    };
    class ColorRegistry {
        constructor() {
            this._onDidChangeSchema = new event_1.Emitter();
            this.onDidChangeSchema = this._onDidChangeSchema.event;
            this.colorSchema = { type: 'object', properties: {} };
            this.colorReferenceSchema = { type: 'string', enum: [], enumDescriptions: [] };
            this.colorsById = {};
        }
        registerColor(id, defaults, description, needsTransparency = false, deprecationMessage) {
            let colorContribution = { id, description, defaults, needsTransparency, deprecationMessage };
            this.colorsById[id] = colorContribution;
            let propertySchema = { type: 'string', description, format: 'color-hex', defaultSnippets: [{ body: '${1:#ff0000}' }] };
            if (deprecationMessage) {
                propertySchema.deprecationMessage = deprecationMessage;
            }
            this.colorSchema.properties[id] = propertySchema;
            this.colorReferenceSchema.enum.push(id);
            this.colorReferenceSchema.enumDescriptions.push(description);
            this._onDidChangeSchema.fire();
            return id;
        }
        deregisterColor(id) {
            delete this.colorsById[id];
            delete this.colorSchema.properties[id];
            const index = this.colorReferenceSchema.enum.indexOf(id);
            if (index !== -1) {
                this.colorReferenceSchema.enum.splice(index, 1);
                this.colorReferenceSchema.enumDescriptions.splice(index, 1);
            }
            this._onDidChangeSchema.fire();
        }
        getColors() {
            return Object.keys(this.colorsById).map(id => this.colorsById[id]);
        }
        resolveDefaultColor(id, theme) {
            const colorDesc = this.colorsById[id];
            if (colorDesc && colorDesc.defaults) {
                const colorValue = colorDesc.defaults[theme.type];
                return resolveColorValue(colorValue, theme);
            }
            return undefined;
        }
        getColorSchema() {
            return this.colorSchema;
        }
        getColorReferenceSchema() {
            return this.colorReferenceSchema;
        }
        toString() {
            let sorter = (a, b) => {
                let cat1 = a.indexOf('.') === -1 ? 0 : 1;
                let cat2 = b.indexOf('.') === -1 ? 0 : 1;
                if (cat1 !== cat2) {
                    return cat1 - cat2;
                }
                return a.localeCompare(b);
            };
            return Object.keys(this.colorsById).sort(sorter).map(k => `- \`${k}\`: ${this.colorsById[k].description}`).join('\n');
        }
    }
    const colorRegistry = new ColorRegistry();
    platform.Registry.add(exports.Extensions.ColorContribution, colorRegistry);
    function registerColor(id, defaults, description, needsTransparency, deprecationMessage) {
        return colorRegistry.registerColor(id, defaults, description, needsTransparency, deprecationMessage);
    }
    exports.registerColor = registerColor;
    function getColorRegistry() {
        return colorRegistry;
    }
    exports.getColorRegistry = getColorRegistry;
    // ----- base colors
    exports.foreground = registerColor('foreground', { dark: '#CCCCCC', light: '#616161', hc: '#FFFFFF' }, nls.localize(0, null));
    exports.errorForeground = registerColor('errorForeground', { dark: '#F48771', light: '#A1260D', hc: '#F48771' }, nls.localize(1, null));
    exports.descriptionForeground = registerColor('descriptionForeground', { light: '#717171', dark: transparent(exports.foreground, 0.7), hc: transparent(exports.foreground, 0.7) }, nls.localize(2, null));
    exports.iconForeground = registerColor('icon.foreground', { dark: '#C5C5C5', light: '#424242', hc: '#FFFFFF' }, nls.localize(3, null));
    exports.focusBorder = registerColor('focusBorder', { dark: '#007FD4', light: '#0090F1', hc: '#F38518' }, nls.localize(4, null));
    exports.contrastBorder = registerColor('contrastBorder', { light: null, dark: null, hc: '#6FC3DF' }, nls.localize(5, null));
    exports.activeContrastBorder = registerColor('contrastActiveBorder', { light: null, dark: null, hc: exports.focusBorder }, nls.localize(6, null));
    exports.selectionBackground = registerColor('selection.background', { light: null, dark: null, hc: null }, nls.localize(7, null));
    // ------ text colors
    exports.textSeparatorForeground = registerColor('textSeparator.foreground', { light: '#0000002e', dark: '#ffffff2e', hc: color_1.Color.black }, nls.localize(8, null));
    exports.textLinkForeground = registerColor('textLink.foreground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, nls.localize(9, null));
    exports.textLinkActiveForeground = registerColor('textLink.activeForeground', { light: '#006AB1', dark: '#3794FF', hc: '#3794FF' }, nls.localize(10, null));
    exports.textPreformatForeground = registerColor('textPreformat.foreground', { light: '#A31515', dark: '#D7BA7D', hc: '#D7BA7D' }, nls.localize(11, null));
    exports.textBlockQuoteBackground = registerColor('textBlockQuote.background', { light: '#7f7f7f1a', dark: '#7f7f7f1a', hc: null }, nls.localize(12, null));
    exports.textBlockQuoteBorder = registerColor('textBlockQuote.border', { light: '#007acc80', dark: '#007acc80', hc: color_1.Color.white }, nls.localize(13, null));
    exports.textCodeBlockBackground = registerColor('textCodeBlock.background', { light: '#dcdcdc66', dark: '#0a0a0a66', hc: color_1.Color.black }, nls.localize(14, null));
    // ----- widgets
    exports.widgetShadow = registerColor('widget.shadow', { dark: transparent(color_1.Color.black, .36), light: transparent(color_1.Color.black, .16), hc: null }, nls.localize(15, null));
    exports.inputBackground = registerColor('input.background', { dark: '#3C3C3C', light: color_1.Color.white, hc: color_1.Color.black }, nls.localize(16, null));
    exports.inputForeground = registerColor('input.foreground', { dark: exports.foreground, light: exports.foreground, hc: exports.foreground }, nls.localize(17, null));
    exports.inputBorder = registerColor('input.border', { dark: null, light: null, hc: exports.contrastBorder }, nls.localize(18, null));
    exports.inputActiveOptionBorder = registerColor('inputOption.activeBorder', { dark: '#007ACC00', light: '#007ACC00', hc: exports.contrastBorder }, nls.localize(19, null));
    exports.inputActiveOptionBackground = registerColor('inputOption.activeBackground', { dark: transparent(exports.focusBorder, 0.4), light: transparent(exports.focusBorder, 0.2), hc: color_1.Color.transparent }, nls.localize(20, null));
    exports.inputActiveOptionForeground = registerColor('inputOption.activeForeground', { dark: color_1.Color.white, light: color_1.Color.black, hc: null }, nls.localize(21, null));
    exports.inputPlaceholderForeground = registerColor('input.placeholderForeground', { light: transparent(exports.foreground, 0.5), dark: transparent(exports.foreground, 0.5), hc: transparent(exports.foreground, 0.7) }, nls.localize(22, null));
    exports.inputValidationInfoBackground = registerColor('inputValidation.infoBackground', { dark: '#063B49', light: '#D6ECF2', hc: color_1.Color.black }, nls.localize(23, null));
    exports.inputValidationInfoForeground = registerColor('inputValidation.infoForeground', { dark: null, light: null, hc: null }, nls.localize(24, null));
    exports.inputValidationInfoBorder = registerColor('inputValidation.infoBorder', { dark: '#007acc', light: '#007acc', hc: exports.contrastBorder }, nls.localize(25, null));
    exports.inputValidationWarningBackground = registerColor('inputValidation.warningBackground', { dark: '#352A05', light: '#F6F5D2', hc: color_1.Color.black }, nls.localize(26, null));
    exports.inputValidationWarningForeground = registerColor('inputValidation.warningForeground', { dark: null, light: null, hc: null }, nls.localize(27, null));
    exports.inputValidationWarningBorder = registerColor('inputValidation.warningBorder', { dark: '#B89500', light: '#B89500', hc: exports.contrastBorder }, nls.localize(28, null));
    exports.inputValidationErrorBackground = registerColor('inputValidation.errorBackground', { dark: '#5A1D1D', light: '#F2DEDE', hc: color_1.Color.black }, nls.localize(29, null));
    exports.inputValidationErrorForeground = registerColor('inputValidation.errorForeground', { dark: null, light: null, hc: null }, nls.localize(30, null));
    exports.inputValidationErrorBorder = registerColor('inputValidation.errorBorder', { dark: '#BE1100', light: '#BE1100', hc: exports.contrastBorder }, nls.localize(31, null));
    exports.selectBackground = registerColor('dropdown.background', { dark: '#3C3C3C', light: color_1.Color.white, hc: color_1.Color.black }, nls.localize(32, null));
    exports.selectListBackground = registerColor('dropdown.listBackground', { dark: null, light: null, hc: color_1.Color.black }, nls.localize(33, null));
    exports.selectForeground = registerColor('dropdown.foreground', { dark: '#F0F0F0', light: null, hc: color_1.Color.white }, nls.localize(34, null));
    exports.selectBorder = registerColor('dropdown.border', { dark: exports.selectBackground, light: '#CECECE', hc: exports.contrastBorder }, nls.localize(35, null));
    exports.simpleCheckboxBackground = registerColor('checkbox.background', { dark: exports.selectBackground, light: exports.selectBackground, hc: exports.selectBackground }, nls.localize(36, null));
    exports.simpleCheckboxForeground = registerColor('checkbox.foreground', { dark: exports.selectForeground, light: exports.selectForeground, hc: exports.selectForeground }, nls.localize(37, null));
    exports.simpleCheckboxBorder = registerColor('checkbox.border', { dark: exports.selectBorder, light: exports.selectBorder, hc: exports.selectBorder }, nls.localize(38, null));
    exports.buttonForeground = registerColor('button.foreground', { dark: color_1.Color.white, light: color_1.Color.white, hc: color_1.Color.white }, nls.localize(39, null));
    exports.buttonBackground = registerColor('button.background', { dark: '#0E639C', light: '#007ACC', hc: null }, nls.localize(40, null));
    exports.buttonHoverBackground = registerColor('button.hoverBackground', { dark: lighten(exports.buttonBackground, 0.2), light: darken(exports.buttonBackground, 0.2), hc: null }, nls.localize(41, null));
    exports.buttonBorder = registerColor('button.border', { dark: exports.contrastBorder, light: exports.contrastBorder, hc: exports.contrastBorder }, nls.localize(42, null));
    exports.buttonSecondaryForeground = registerColor('button.secondaryForeground', { dark: color_1.Color.white, light: color_1.Color.white, hc: color_1.Color.white }, nls.localize(43, null));
    exports.buttonSecondaryBackground = registerColor('button.secondaryBackground', { dark: '#3A3D41', light: '#5F6A79', hc: null }, nls.localize(44, null));
    exports.buttonSecondaryHoverBackground = registerColor('button.secondaryHoverBackground', { dark: lighten(exports.buttonSecondaryBackground, 0.2), light: darken(exports.buttonSecondaryBackground, 0.2), hc: null }, nls.localize(45, null));
    exports.badgeBackground = registerColor('badge.background', { dark: '#4D4D4D', light: '#C4C4C4', hc: color_1.Color.black }, nls.localize(46, null));
    exports.badgeForeground = registerColor('badge.foreground', { dark: color_1.Color.white, light: '#333', hc: color_1.Color.white }, nls.localize(47, null));
    exports.scrollbarShadow = registerColor('scrollbar.shadow', { dark: '#000000', light: '#DDDDDD', hc: null }, nls.localize(48, null));
    exports.scrollbarSliderBackground = registerColor('scrollbarSlider.background', { dark: color_1.Color.fromHex('#797979').transparent(0.4), light: color_1.Color.fromHex('#646464').transparent(0.4), hc: transparent(exports.contrastBorder, 0.6) }, nls.localize(49, null));
    exports.scrollbarSliderHoverBackground = registerColor('scrollbarSlider.hoverBackground', { dark: color_1.Color.fromHex('#646464').transparent(0.7), light: color_1.Color.fromHex('#646464').transparent(0.7), hc: transparent(exports.contrastBorder, 0.8) }, nls.localize(50, null));
    exports.scrollbarSliderActiveBackground = registerColor('scrollbarSlider.activeBackground', { dark: color_1.Color.fromHex('#BFBFBF').transparent(0.4), light: color_1.Color.fromHex('#000000').transparent(0.6), hc: exports.contrastBorder }, nls.localize(51, null));
    exports.progressBarBackground = registerColor('progressBar.background', { dark: color_1.Color.fromHex('#0E70C0'), light: color_1.Color.fromHex('#0E70C0'), hc: exports.contrastBorder }, nls.localize(52, null));
    exports.editorErrorBackground = registerColor('editorError.background', { dark: null, light: null, hc: null }, nls.localize(53, null), true);
    exports.editorErrorForeground = registerColor('editorError.foreground', { dark: '#F48771', light: '#E51400', hc: null }, nls.localize(54, null));
    exports.editorErrorBorder = registerColor('editorError.border', { dark: null, light: null, hc: color_1.Color.fromHex('#E47777').transparent(0.8) }, nls.localize(55, null));
    exports.editorWarningBackground = registerColor('editorWarning.background', { dark: null, light: null, hc: null }, nls.localize(56, null), true);
    exports.editorWarningForeground = registerColor('editorWarning.foreground', { dark: '#CCA700', light: '#BF8803', hc: null }, nls.localize(57, null));
    exports.editorWarningBorder = registerColor('editorWarning.border', { dark: null, light: null, hc: color_1.Color.fromHex('#FFCC00').transparent(0.8) }, nls.localize(58, null));
    exports.editorInfoBackground = registerColor('editorInfo.background', { dark: null, light: null, hc: null }, nls.localize(59, null), true);
    exports.editorInfoForeground = registerColor('editorInfo.foreground', { dark: '#75BEFF', light: '#75BEFF', hc: null }, nls.localize(60, null));
    exports.editorInfoBorder = registerColor('editorInfo.border', { dark: null, light: null, hc: color_1.Color.fromHex('#75BEFF').transparent(0.8) }, nls.localize(61, null));
    exports.editorHintForeground = registerColor('editorHint.foreground', { dark: color_1.Color.fromHex('#eeeeee').transparent(0.7), light: '#6c6c6c', hc: null }, nls.localize(62, null));
    exports.editorHintBorder = registerColor('editorHint.border', { dark: null, light: null, hc: color_1.Color.fromHex('#eeeeee').transparent(0.8) }, nls.localize(63, null));
    exports.sashHoverBorder = registerColor('sash.hoverBorder', { dark: exports.focusBorder, light: exports.focusBorder, hc: exports.focusBorder }, nls.localize(64, null));
    /**
     * Editor background color.
     * Because of bug https://monacotools.visualstudio.com/DefaultCollection/Monaco/_workitems/edit/13254
     * we are *not* using the color white (or #ffffff, rgba(255,255,255)) but something very close to white.
     */
    exports.editorBackground = registerColor('editor.background', { light: '#fffffe', dark: '#1E1E1E', hc: color_1.Color.black }, nls.localize(65, null));
    /**
     * Editor foreground color.
     */
    exports.editorForeground = registerColor('editor.foreground', { light: '#333333', dark: '#BBBBBB', hc: color_1.Color.white }, nls.localize(66, null));
    /**
     * Editor widgets
     */
    exports.editorWidgetBackground = registerColor('editorWidget.background', { dark: '#252526', light: '#F3F3F3', hc: '#0C141F' }, nls.localize(67, null));
    exports.editorWidgetForeground = registerColor('editorWidget.foreground', { dark: exports.foreground, light: exports.foreground, hc: exports.foreground }, nls.localize(68, null));
    exports.editorWidgetBorder = registerColor('editorWidget.border', { dark: '#454545', light: '#C8C8C8', hc: exports.contrastBorder }, nls.localize(69, null));
    exports.editorWidgetResizeBorder = registerColor('editorWidget.resizeBorder', { light: null, dark: null, hc: null }, nls.localize(70, null));
    /**
     * Quick pick widget
     */
    exports.quickInputBackground = registerColor('quickInput.background', { dark: exports.editorWidgetBackground, light: exports.editorWidgetBackground, hc: exports.editorWidgetBackground }, nls.localize(71, null));
    exports.quickInputForeground = registerColor('quickInput.foreground', { dark: exports.editorWidgetForeground, light: exports.editorWidgetForeground, hc: exports.editorWidgetForeground }, nls.localize(72, null));
    exports.quickInputTitleBackground = registerColor('quickInputTitle.background', { dark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.105)), light: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.06)), hc: '#000000' }, nls.localize(73, null));
    exports.pickerGroupForeground = registerColor('pickerGroup.foreground', { dark: '#3794FF', light: '#0066BF', hc: color_1.Color.white }, nls.localize(74, null));
    exports.pickerGroupBorder = registerColor('pickerGroup.border', { dark: '#3F3F46', light: '#CCCEDB', hc: color_1.Color.white }, nls.localize(75, null));
    /**
     * Keybinding label
     */
    exports.keybindingLabelBackground = registerColor('keybindingLabel.background', { dark: new color_1.Color(new color_1.RGBA(128, 128, 128, 0.17)), light: new color_1.Color(new color_1.RGBA(221, 221, 221, 0.4)), hc: color_1.Color.transparent }, nls.localize(76, null));
    exports.keybindingLabelForeground = registerColor('keybindingLabel.foreground', { dark: color_1.Color.fromHex('#CCCCCC'), light: color_1.Color.fromHex('#555555'), hc: color_1.Color.white }, nls.localize(77, null));
    exports.keybindingLabelBorder = registerColor('keybindingLabel.border', { dark: new color_1.Color(new color_1.RGBA(51, 51, 51, 0.6)), light: new color_1.Color(new color_1.RGBA(204, 204, 204, 0.4)), hc: new color_1.Color(new color_1.RGBA(111, 195, 223)) }, nls.localize(78, null));
    exports.keybindingLabelBottomBorder = registerColor('keybindingLabel.bottomBorder', { dark: new color_1.Color(new color_1.RGBA(68, 68, 68, 0.6)), light: new color_1.Color(new color_1.RGBA(187, 187, 187, 0.4)), hc: new color_1.Color(new color_1.RGBA(111, 195, 223)) }, nls.localize(79, null));
    /**
     * Editor selection colors.
     */
    exports.editorSelectionBackground = registerColor('editor.selectionBackground', { light: '#ADD6FF', dark: '#264F78', hc: '#f3f518' }, nls.localize(80, null));
    exports.editorSelectionForeground = registerColor('editor.selectionForeground', { light: null, dark: null, hc: '#000000' }, nls.localize(81, null));
    exports.editorInactiveSelection = registerColor('editor.inactiveSelectionBackground', { light: transparent(exports.editorSelectionBackground, 0.5), dark: transparent(exports.editorSelectionBackground, 0.5), hc: transparent(exports.editorSelectionBackground, 0.5) }, nls.localize(82, null), true);
    exports.editorSelectionHighlight = registerColor('editor.selectionHighlightBackground', { light: lessProminent(exports.editorSelectionBackground, exports.editorBackground, 0.3, 0.6), dark: lessProminent(exports.editorSelectionBackground, exports.editorBackground, 0.3, 0.6), hc: null }, nls.localize(83, null), true);
    exports.editorSelectionHighlightBorder = registerColor('editor.selectionHighlightBorder', { light: null, dark: null, hc: exports.activeContrastBorder }, nls.localize(84, null));
    /**
     * Editor find match colors.
     */
    exports.editorFindMatch = registerColor('editor.findMatchBackground', { light: '#A8AC94', dark: '#515C6A', hc: null }, nls.localize(85, null));
    exports.editorFindMatchHighlight = registerColor('editor.findMatchHighlightBackground', { light: '#EA5C0055', dark: '#EA5C0055', hc: null }, nls.localize(86, null), true);
    exports.editorFindRangeHighlight = registerColor('editor.findRangeHighlightBackground', { dark: '#3a3d4166', light: '#b4b4b44d', hc: null }, nls.localize(87, null), true);
    exports.editorFindMatchBorder = registerColor('editor.findMatchBorder', { light: null, dark: null, hc: exports.activeContrastBorder }, nls.localize(88, null));
    exports.editorFindMatchHighlightBorder = registerColor('editor.findMatchHighlightBorder', { light: null, dark: null, hc: exports.activeContrastBorder }, nls.localize(89, null));
    exports.editorFindRangeHighlightBorder = registerColor('editor.findRangeHighlightBorder', { dark: null, light: null, hc: transparent(exports.activeContrastBorder, 0.4) }, nls.localize(90, null), true);
    /**
     * Search Editor query match colors.
     *
     * Distinct from normal editor find match to allow for better differentiation
     */
    exports.searchEditorFindMatch = registerColor('searchEditor.findMatchBackground', { light: transparent(exports.editorFindMatchHighlight, 0.66), dark: transparent(exports.editorFindMatchHighlight, 0.66), hc: exports.editorFindMatchHighlight }, nls.localize(91, null));
    exports.searchEditorFindMatchBorder = registerColor('searchEditor.findMatchBorder', { light: transparent(exports.editorFindMatchHighlightBorder, 0.66), dark: transparent(exports.editorFindMatchHighlightBorder, 0.66), hc: exports.editorFindMatchHighlightBorder }, nls.localize(92, null));
    /**
     * Editor hover
     */
    exports.editorHoverHighlight = registerColor('editor.hoverHighlightBackground', { light: '#ADD6FF26', dark: '#264f7840', hc: '#ADD6FF26' }, nls.localize(93, null), true);
    exports.editorHoverBackground = registerColor('editorHoverWidget.background', { light: exports.editorWidgetBackground, dark: exports.editorWidgetBackground, hc: exports.editorWidgetBackground }, nls.localize(94, null));
    exports.editorHoverForeground = registerColor('editorHoverWidget.foreground', { light: exports.editorWidgetForeground, dark: exports.editorWidgetForeground, hc: exports.editorWidgetForeground }, nls.localize(95, null));
    exports.editorHoverBorder = registerColor('editorHoverWidget.border', { light: exports.editorWidgetBorder, dark: exports.editorWidgetBorder, hc: exports.editorWidgetBorder }, nls.localize(96, null));
    exports.editorHoverStatusBarBackground = registerColor('editorHoverWidget.statusBarBackground', { dark: lighten(exports.editorHoverBackground, 0.2), light: darken(exports.editorHoverBackground, 0.05), hc: exports.editorWidgetBackground }, nls.localize(97, null));
    /**
     * Editor link colors
     */
    exports.editorActiveLinkForeground = registerColor('editorLink.activeForeground', { dark: '#4E94CE', light: color_1.Color.blue, hc: color_1.Color.cyan }, nls.localize(98, null));
    /**
     * Inline hints
     */
    exports.editorInlineHintForeground = registerColor('editorInlineHint.foreground', { dark: exports.editorWidgetBackground, light: exports.editorWidgetForeground, hc: exports.editorWidgetBackground }, nls.localize(99, null));
    exports.editorInlineHintBackground = registerColor('editorInlineHint.background', { dark: exports.editorWidgetForeground, light: exports.editorWidgetBackground, hc: exports.editorWidgetForeground }, nls.localize(100, null));
    /**
     * Editor lighbulb icon colors
     */
    exports.editorLightBulbForeground = registerColor('editorLightBulb.foreground', { dark: '#FFCC00', light: '#DDB100', hc: '#FFCC00' }, nls.localize(101, null));
    exports.editorLightBulbAutoFixForeground = registerColor('editorLightBulbAutoFix.foreground', { dark: '#75BEFF', light: '#007ACC', hc: '#75BEFF' }, nls.localize(102, null));
    /**
     * Diff Editor Colors
     */
    exports.defaultInsertColor = new color_1.Color(new color_1.RGBA(155, 185, 85, 0.2));
    exports.defaultRemoveColor = new color_1.Color(new color_1.RGBA(255, 0, 0, 0.2));
    exports.diffInserted = registerColor('diffEditor.insertedTextBackground', { dark: exports.defaultInsertColor, light: exports.defaultInsertColor, hc: null }, nls.localize(103, null), true);
    exports.diffRemoved = registerColor('diffEditor.removedTextBackground', { dark: exports.defaultRemoveColor, light: exports.defaultRemoveColor, hc: null }, nls.localize(104, null), true);
    exports.diffInsertedOutline = registerColor('diffEditor.insertedTextBorder', { dark: null, light: null, hc: '#33ff2eff' }, nls.localize(105, null));
    exports.diffRemovedOutline = registerColor('diffEditor.removedTextBorder', { dark: null, light: null, hc: '#FF008F' }, nls.localize(106, null));
    exports.diffBorder = registerColor('diffEditor.border', { dark: null, light: null, hc: exports.contrastBorder }, nls.localize(107, null));
    exports.diffDiagonalFill = registerColor('diffEditor.diagonalFill', { dark: '#cccccc33', light: '#22222233', hc: null }, nls.localize(108, null));
    /**
     * List and tree colors
     */
    exports.listFocusBackground = registerColor('list.focusBackground', { dark: null, light: null, hc: null }, nls.localize(109, null));
    exports.listFocusForeground = registerColor('list.focusForeground', { dark: null, light: null, hc: null }, nls.localize(110, null));
    exports.listFocusOutline = registerColor('list.focusOutline', { dark: exports.focusBorder, light: exports.focusBorder, hc: exports.activeContrastBorder }, nls.localize(111, null));
    exports.listActiveSelectionBackground = registerColor('list.activeSelectionBackground', { dark: '#094771', light: '#0060C0', hc: null }, nls.localize(112, null));
    exports.listActiveSelectionForeground = registerColor('list.activeSelectionForeground', { dark: color_1.Color.white, light: color_1.Color.white, hc: null }, nls.localize(113, null));
    exports.listInactiveSelectionBackground = registerColor('list.inactiveSelectionBackground', { dark: '#37373D', light: '#E4E6F1', hc: null }, nls.localize(114, null));
    exports.listInactiveSelectionForeground = registerColor('list.inactiveSelectionForeground', { dark: null, light: null, hc: null }, nls.localize(115, null));
    exports.listInactiveFocusBackground = registerColor('list.inactiveFocusBackground', { dark: null, light: null, hc: null }, nls.localize(116, null));
    exports.listInactiveFocusOutline = registerColor('list.inactiveFocusOutline', { dark: null, light: null, hc: null }, nls.localize(117, null));
    exports.listHoverBackground = registerColor('list.hoverBackground', { dark: '#2A2D2E', light: '#F0F0F0', hc: null }, nls.localize(118, null));
    exports.listHoverForeground = registerColor('list.hoverForeground', { dark: null, light: null, hc: null }, nls.localize(119, null));
    exports.listDropBackground = registerColor('list.dropBackground', { dark: '#062F4A', light: '#D6EBFF', hc: null }, nls.localize(120, null));
    exports.listHighlightForeground = registerColor('list.highlightForeground', { dark: '#0097fb', light: '#0066BF', hc: exports.focusBorder }, nls.localize(121, null));
    exports.listInvalidItemForeground = registerColor('list.invalidItemForeground', { dark: '#B89500', light: '#B89500', hc: '#B89500' }, nls.localize(122, null));
    exports.listErrorForeground = registerColor('list.errorForeground', { dark: '#F88070', light: '#B01011', hc: null }, nls.localize(123, null));
    exports.listWarningForeground = registerColor('list.warningForeground', { dark: '#CCA700', light: '#855F00', hc: null }, nls.localize(124, null));
    exports.listFilterWidgetBackground = registerColor('listFilterWidget.background', { light: '#efc1ad', dark: '#653723', hc: color_1.Color.black }, nls.localize(125, null));
    exports.listFilterWidgetOutline = registerColor('listFilterWidget.outline', { dark: color_1.Color.transparent, light: color_1.Color.transparent, hc: '#f38518' }, nls.localize(126, null));
    exports.listFilterWidgetNoMatchesOutline = registerColor('listFilterWidget.noMatchesOutline', { dark: '#BE1100', light: '#BE1100', hc: exports.contrastBorder }, nls.localize(127, null));
    exports.listFilterMatchHighlight = registerColor('list.filterMatchBackground', { dark: exports.editorFindMatchHighlight, light: exports.editorFindMatchHighlight, hc: null }, nls.localize(128, null));
    exports.listFilterMatchHighlightBorder = registerColor('list.filterMatchBorder', { dark: exports.editorFindMatchHighlightBorder, light: exports.editorFindMatchHighlightBorder, hc: exports.contrastBorder }, nls.localize(129, null));
    exports.treeIndentGuidesStroke = registerColor('tree.indentGuidesStroke', { dark: '#585858', light: '#a9a9a9', hc: '#a9a9a9' }, nls.localize(130, null));
    exports.tableColumnsBorder = registerColor('tree.tableColumnsBorder', { dark: '#CCCCCC20', light: '#61616120', hc: null }, nls.localize(131, null));
    exports.listDeemphasizedForeground = registerColor('list.deemphasizedForeground', { dark: '#8C8C8C', light: '#8E8E90', hc: '#A7A8A9' }, nls.localize(132, null));
    /**
     * Quick pick widget (dependent on List and tree colors)
     */
    exports._deprecatedQuickInputListFocusBackground = registerColor('quickInput.list.focusBackground', { dark: null, light: null, hc: null }, '', undefined, nls.localize(133, null));
    exports.quickInputListFocusBackground = registerColor('quickInputList.focusBackground', { dark: oneOf(exports._deprecatedQuickInputListFocusBackground, exports.listFocusBackground, '#062F4A'), light: oneOf(exports._deprecatedQuickInputListFocusBackground, exports.listFocusBackground, '#D6EBFF'), hc: null }, nls.localize(134, null));
    /**
     * Menu colors
     */
    exports.menuBorder = registerColor('menu.border', { dark: null, light: null, hc: exports.contrastBorder }, nls.localize(135, null));
    exports.menuForeground = registerColor('menu.foreground', { dark: exports.selectForeground, light: exports.foreground, hc: exports.selectForeground }, nls.localize(136, null));
    exports.menuBackground = registerColor('menu.background', { dark: exports.selectBackground, light: exports.selectBackground, hc: exports.selectBackground }, nls.localize(137, null));
    exports.menuSelectionForeground = registerColor('menu.selectionForeground', { dark: exports.listActiveSelectionForeground, light: exports.listActiveSelectionForeground, hc: exports.listActiveSelectionForeground }, nls.localize(138, null));
    exports.menuSelectionBackground = registerColor('menu.selectionBackground', { dark: exports.listActiveSelectionBackground, light: exports.listActiveSelectionBackground, hc: exports.listActiveSelectionBackground }, nls.localize(139, null));
    exports.menuSelectionBorder = registerColor('menu.selectionBorder', { dark: null, light: null, hc: exports.activeContrastBorder }, nls.localize(140, null));
    exports.menuSeparatorBackground = registerColor('menu.separatorBackground', { dark: '#BBBBBB', light: '#888888', hc: exports.contrastBorder }, nls.localize(141, null));
    /**
     * Toolbar colors
     */
    exports.toolbarHoverBackground = registerColor('toolbar.hoverBackground', { dark: '#5a5d5e50', light: '#b8b8b850', hc: null }, nls.localize(142, null));
    exports.toolbarHoverOutline = registerColor('toolbar.hoverOutline', { dark: null, light: null, hc: exports.activeContrastBorder }, nls.localize(143, null));
    exports.toolbarActiveBackground = registerColor('toolbar.activeBackground', { dark: lighten(exports.toolbarHoverBackground, 0.1), light: darken(exports.toolbarHoverBackground, 0.1), hc: null }, nls.localize(144, null));
    /**
     * Snippet placeholder colors
     */
    exports.snippetTabstopHighlightBackground = registerColor('editor.snippetTabstopHighlightBackground', { dark: new color_1.Color(new color_1.RGBA(124, 124, 124, 0.3)), light: new color_1.Color(new color_1.RGBA(10, 50, 100, 0.2)), hc: new color_1.Color(new color_1.RGBA(124, 124, 124, 0.3)) }, nls.localize(145, null));
    exports.snippetTabstopHighlightBorder = registerColor('editor.snippetTabstopHighlightBorder', { dark: null, light: null, hc: null }, nls.localize(146, null));
    exports.snippetFinalTabstopHighlightBackground = registerColor('editor.snippetFinalTabstopHighlightBackground', { dark: null, light: null, hc: null }, nls.localize(147, null));
    exports.snippetFinalTabstopHighlightBorder = registerColor('editor.snippetFinalTabstopHighlightBorder', { dark: '#525252', light: new color_1.Color(new color_1.RGBA(10, 50, 100, 0.5)), hc: '#525252' }, nls.localize(148, null));
    /**
     * Breadcrumb colors
     */
    exports.breadcrumbsForeground = registerColor('breadcrumb.foreground', { light: transparent(exports.foreground, 0.8), dark: transparent(exports.foreground, 0.8), hc: transparent(exports.foreground, 0.8) }, nls.localize(149, null));
    exports.breadcrumbsBackground = registerColor('breadcrumb.background', { light: exports.editorBackground, dark: exports.editorBackground, hc: exports.editorBackground }, nls.localize(150, null));
    exports.breadcrumbsFocusForeground = registerColor('breadcrumb.focusForeground', { light: darken(exports.foreground, 0.2), dark: lighten(exports.foreground, 0.1), hc: lighten(exports.foreground, 0.1) }, nls.localize(151, null));
    exports.breadcrumbsActiveSelectionForeground = registerColor('breadcrumb.activeSelectionForeground', { light: darken(exports.foreground, 0.2), dark: lighten(exports.foreground, 0.1), hc: lighten(exports.foreground, 0.1) }, nls.localize(152, null));
    exports.breadcrumbsPickerBackground = registerColor('breadcrumbPicker.background', { light: exports.editorWidgetBackground, dark: exports.editorWidgetBackground, hc: exports.editorWidgetBackground }, nls.localize(153, null));
    /**
     * Merge-conflict colors
     */
    const headerTransparency = 0.5;
    const currentBaseColor = color_1.Color.fromHex('#40C8AE').transparent(headerTransparency);
    const incomingBaseColor = color_1.Color.fromHex('#40A6FF').transparent(headerTransparency);
    const commonBaseColor = color_1.Color.fromHex('#606060').transparent(0.4);
    const contentTransparency = 0.4;
    const rulerTransparency = 1;
    exports.mergeCurrentHeaderBackground = registerColor('merge.currentHeaderBackground', { dark: currentBaseColor, light: currentBaseColor, hc: null }, nls.localize(154, null), true);
    exports.mergeCurrentContentBackground = registerColor('merge.currentContentBackground', { dark: transparent(exports.mergeCurrentHeaderBackground, contentTransparency), light: transparent(exports.mergeCurrentHeaderBackground, contentTransparency), hc: transparent(exports.mergeCurrentHeaderBackground, contentTransparency) }, nls.localize(155, null), true);
    exports.mergeIncomingHeaderBackground = registerColor('merge.incomingHeaderBackground', { dark: incomingBaseColor, light: incomingBaseColor, hc: null }, nls.localize(156, null), true);
    exports.mergeIncomingContentBackground = registerColor('merge.incomingContentBackground', { dark: transparent(exports.mergeIncomingHeaderBackground, contentTransparency), light: transparent(exports.mergeIncomingHeaderBackground, contentTransparency), hc: transparent(exports.mergeIncomingHeaderBackground, contentTransparency) }, nls.localize(157, null), true);
    exports.mergeCommonHeaderBackground = registerColor('merge.commonHeaderBackground', { dark: commonBaseColor, light: commonBaseColor, hc: null }, nls.localize(158, null), true);
    exports.mergeCommonContentBackground = registerColor('merge.commonContentBackground', { dark: transparent(exports.mergeCommonHeaderBackground, contentTransparency), light: transparent(exports.mergeCommonHeaderBackground, contentTransparency), hc: transparent(exports.mergeCommonHeaderBackground, contentTransparency) }, nls.localize(159, null), true);
    exports.mergeBorder = registerColor('merge.border', { dark: null, light: null, hc: '#C3DF6F' }, nls.localize(160, null));
    exports.overviewRulerCurrentContentForeground = registerColor('editorOverviewRuler.currentContentForeground', { dark: transparent(exports.mergeCurrentHeaderBackground, rulerTransparency), light: transparent(exports.mergeCurrentHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize(161, null));
    exports.overviewRulerIncomingContentForeground = registerColor('editorOverviewRuler.incomingContentForeground', { dark: transparent(exports.mergeIncomingHeaderBackground, rulerTransparency), light: transparent(exports.mergeIncomingHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize(162, null));
    exports.overviewRulerCommonContentForeground = registerColor('editorOverviewRuler.commonContentForeground', { dark: transparent(exports.mergeCommonHeaderBackground, rulerTransparency), light: transparent(exports.mergeCommonHeaderBackground, rulerTransparency), hc: exports.mergeBorder }, nls.localize(163, null));
    exports.overviewRulerFindMatchForeground = registerColor('editorOverviewRuler.findMatchForeground', { dark: '#d186167e', light: '#d186167e', hc: '#AB5A00' }, nls.localize(164, null), true);
    exports.overviewRulerSelectionHighlightForeground = registerColor('editorOverviewRuler.selectionHighlightForeground', { dark: '#A0A0A0CC', light: '#A0A0A0CC', hc: '#A0A0A0CC' }, nls.localize(165, null), true);
    exports.minimapFindMatch = registerColor('minimap.findMatchHighlight', { light: '#d18616', dark: '#d18616', hc: '#AB5A00' }, nls.localize(166, null), true);
    exports.minimapSelection = registerColor('minimap.selectionHighlight', { light: '#ADD6FF', dark: '#264F78', hc: '#ffffff' }, nls.localize(167, null), true);
    exports.minimapError = registerColor('minimap.errorHighlight', { dark: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), light: new color_1.Color(new color_1.RGBA(255, 18, 18, 0.7)), hc: new color_1.Color(new color_1.RGBA(255, 50, 50, 1)) }, nls.localize(168, null));
    exports.minimapWarning = registerColor('minimap.warningHighlight', { dark: exports.editorWarningForeground, light: exports.editorWarningForeground, hc: exports.editorWarningBorder }, nls.localize(169, null));
    exports.minimapBackground = registerColor('minimap.background', { dark: null, light: null, hc: null }, nls.localize(170, null));
    exports.minimapSliderBackground = registerColor('minimapSlider.background', { light: transparent(exports.scrollbarSliderBackground, 0.5), dark: transparent(exports.scrollbarSliderBackground, 0.5), hc: transparent(exports.scrollbarSliderBackground, 0.5) }, nls.localize(171, null));
    exports.minimapSliderHoverBackground = registerColor('minimapSlider.hoverBackground', { light: transparent(exports.scrollbarSliderHoverBackground, 0.5), dark: transparent(exports.scrollbarSliderHoverBackground, 0.5), hc: transparent(exports.scrollbarSliderHoverBackground, 0.5) }, nls.localize(172, null));
    exports.minimapSliderActiveBackground = registerColor('minimapSlider.activeBackground', { light: transparent(exports.scrollbarSliderActiveBackground, 0.5), dark: transparent(exports.scrollbarSliderActiveBackground, 0.5), hc: transparent(exports.scrollbarSliderActiveBackground, 0.5) }, nls.localize(173, null));
    exports.problemsErrorIconForeground = registerColor('problemsErrorIcon.foreground', { dark: exports.editorErrorForeground, light: exports.editorErrorForeground, hc: exports.editorErrorForeground }, nls.localize(174, null));
    exports.problemsWarningIconForeground = registerColor('problemsWarningIcon.foreground', { dark: exports.editorWarningForeground, light: exports.editorWarningForeground, hc: exports.editorWarningForeground }, nls.localize(175, null));
    exports.problemsInfoIconForeground = registerColor('problemsInfoIcon.foreground', { dark: exports.editorInfoForeground, light: exports.editorInfoForeground, hc: exports.editorInfoForeground }, nls.localize(176, null));
    /**
     * Chart colors
     */
    exports.chartsForeground = registerColor('charts.foreground', { dark: exports.foreground, light: exports.foreground, hc: exports.foreground }, nls.localize(177, null));
    exports.chartsLines = registerColor('charts.lines', { dark: transparent(exports.foreground, .5), light: transparent(exports.foreground, .5), hc: transparent(exports.foreground, .5) }, nls.localize(178, null));
    exports.chartsRed = registerColor('charts.red', { dark: exports.editorErrorForeground, light: exports.editorErrorForeground, hc: exports.editorErrorForeground }, nls.localize(179, null));
    exports.chartsBlue = registerColor('charts.blue', { dark: exports.editorInfoForeground, light: exports.editorInfoForeground, hc: exports.editorInfoForeground }, nls.localize(180, null));
    exports.chartsYellow = registerColor('charts.yellow', { dark: exports.editorWarningForeground, light: exports.editorWarningForeground, hc: exports.editorWarningForeground }, nls.localize(181, null));
    exports.chartsOrange = registerColor('charts.orange', { dark: exports.minimapFindMatch, light: exports.minimapFindMatch, hc: exports.minimapFindMatch }, nls.localize(182, null));
    exports.chartsGreen = registerColor('charts.green', { dark: '#89D185', light: '#388A34', hc: '#89D185' }, nls.localize(183, null));
    exports.chartsPurple = registerColor('charts.purple', { dark: '#B180D7', light: '#652D90', hc: '#B180D7' }, nls.localize(184, null));
    // ----- color functions
    function darken(colorValue, factor) {
        return (theme) => {
            let color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.darken(factor);
            }
            return undefined;
        };
    }
    exports.darken = darken;
    function lighten(colorValue, factor) {
        return (theme) => {
            let color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.lighten(factor);
            }
            return undefined;
        };
    }
    exports.lighten = lighten;
    function transparent(colorValue, factor) {
        return (theme) => {
            let color = resolveColorValue(colorValue, theme);
            if (color) {
                return color.transparent(factor);
            }
            return undefined;
        };
    }
    exports.transparent = transparent;
    function oneOf(...colorValues) {
        return (theme) => {
            for (let colorValue of colorValues) {
                let color = resolveColorValue(colorValue, theme);
                if (color) {
                    return color;
                }
            }
            return undefined;
        };
    }
    exports.oneOf = oneOf;
    function lessProminent(colorValue, backgroundColorValue, factor, transparency) {
        return (theme) => {
            let from = resolveColorValue(colorValue, theme);
            if (from) {
                let backgroundColor = resolveColorValue(backgroundColorValue, theme);
                if (backgroundColor) {
                    if (from.isDarkerThan(backgroundColor)) {
                        return color_1.Color.getLighterColor(from, backgroundColor, factor).transparent(transparency);
                    }
                    return color_1.Color.getDarkerColor(from, backgroundColor, factor).transparent(transparency);
                }
                return from.transparent(factor * transparency);
            }
            return undefined;
        };
    }
    // ----- implementation
    /**
     * @param colorValue Resolve a color value in the context of a theme
     */
    function resolveColorValue(colorValue, theme) {
        if (colorValue === null) {
            return undefined;
        }
        else if (typeof colorValue === 'string') {
            if (colorValue[0] === '#') {
                return color_1.Color.fromHex(colorValue);
            }
            return theme.getColor(colorValue);
        }
        else if (colorValue instanceof color_1.Color) {
            return colorValue;
        }
        else if (typeof colorValue === 'function') {
            return colorValue(theme);
        }
        return undefined;
    }
    exports.resolveColorValue = resolveColorValue;
    exports.workbenchColorsSchemaId = 'vscode://schemas/workbench-colors';
    let schemaRegistry = platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(exports.workbenchColorsSchemaId, colorRegistry.getColorSchema());
    const delayer = new async_1.RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(exports.workbenchColorsSchemaId), 200);
    colorRegistry.onDidChangeSchema(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
});
// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
//# sourceMappingURL=colorRegistry.js.map