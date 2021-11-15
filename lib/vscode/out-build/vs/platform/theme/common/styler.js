/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/theme/common/theme"], function (require, exports, colorRegistry_1, color_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.attachDialogStyler = exports.defaultDialogStyles = exports.attachMenuStyler = exports.defaultMenuStyles = exports.attachBreadcrumbsStyler = exports.defaultBreadcrumbsStyles = exports.attachStylerCallback = exports.attachProgressBarStyler = exports.attachLinkStyler = exports.attachKeybindingLabelStyler = exports.attachButtonStyler = exports.defaultListStyles = exports.attachListStyler = exports.attachFindReplaceInputBoxStyler = exports.attachSelectBoxStyler = exports.attachInputBoxStyler = exports.attachBadgeStyler = exports.attachCheckboxStyler = exports.attachStyler = exports.computeStyles = void 0;
    function computeStyles(theme, styleMap) {
        const styles = Object.create(null);
        for (let key in styleMap) {
            const value = styleMap[key];
            if (value) {
                styles[key] = (0, colorRegistry_1.resolveColorValue)(value, theme);
            }
        }
        return styles;
    }
    exports.computeStyles = computeStyles;
    function attachStyler(themeService, styleMap, widgetOrCallback) {
        function applyStyles(theme) {
            const styles = computeStyles(themeService.getColorTheme(), styleMap);
            if (typeof widgetOrCallback === 'function') {
                widgetOrCallback(styles);
            }
            else {
                widgetOrCallback.style(styles);
            }
        }
        applyStyles(themeService.getColorTheme());
        return themeService.onDidColorThemeChange(applyStyles);
    }
    exports.attachStyler = attachStyler;
    function attachCheckboxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputActiveOptionBorder: (style === null || style === void 0 ? void 0 : style.inputActiveOptionBorderColor) || colorRegistry_1.inputActiveOptionBorder,
            inputActiveOptionForeground: (style === null || style === void 0 ? void 0 : style.inputActiveOptionForegroundColor) || colorRegistry_1.inputActiveOptionForeground,
            inputActiveOptionBackground: (style === null || style === void 0 ? void 0 : style.inputActiveOptionBackgroundColor) || colorRegistry_1.inputActiveOptionBackground
        }, widget);
    }
    exports.attachCheckboxStyler = attachCheckboxStyler;
    function attachBadgeStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            badgeBackground: (style === null || style === void 0 ? void 0 : style.badgeBackground) || colorRegistry_1.badgeBackground,
            badgeForeground: (style === null || style === void 0 ? void 0 : style.badgeForeground) || colorRegistry_1.badgeForeground,
            badgeBorder: colorRegistry_1.contrastBorder
        }, widget);
    }
    exports.attachBadgeStyler = attachBadgeStyler;
    function attachInputBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputBackground: (style === null || style === void 0 ? void 0 : style.inputBackground) || colorRegistry_1.inputBackground,
            inputForeground: (style === null || style === void 0 ? void 0 : style.inputForeground) || colorRegistry_1.inputForeground,
            inputBorder: (style === null || style === void 0 ? void 0 : style.inputBorder) || colorRegistry_1.inputBorder,
            inputValidationInfoBorder: (style === null || style === void 0 ? void 0 : style.inputValidationInfoBorder) || colorRegistry_1.inputValidationInfoBorder,
            inputValidationInfoBackground: (style === null || style === void 0 ? void 0 : style.inputValidationInfoBackground) || colorRegistry_1.inputValidationInfoBackground,
            inputValidationInfoForeground: (style === null || style === void 0 ? void 0 : style.inputValidationInfoForeground) || colorRegistry_1.inputValidationInfoForeground,
            inputValidationWarningBorder: (style === null || style === void 0 ? void 0 : style.inputValidationWarningBorder) || colorRegistry_1.inputValidationWarningBorder,
            inputValidationWarningBackground: (style === null || style === void 0 ? void 0 : style.inputValidationWarningBackground) || colorRegistry_1.inputValidationWarningBackground,
            inputValidationWarningForeground: (style === null || style === void 0 ? void 0 : style.inputValidationWarningForeground) || colorRegistry_1.inputValidationWarningForeground,
            inputValidationErrorBorder: (style === null || style === void 0 ? void 0 : style.inputValidationErrorBorder) || colorRegistry_1.inputValidationErrorBorder,
            inputValidationErrorBackground: (style === null || style === void 0 ? void 0 : style.inputValidationErrorBackground) || colorRegistry_1.inputValidationErrorBackground,
            inputValidationErrorForeground: (style === null || style === void 0 ? void 0 : style.inputValidationErrorForeground) || colorRegistry_1.inputValidationErrorForeground
        }, widget);
    }
    exports.attachInputBoxStyler = attachInputBoxStyler;
    function attachSelectBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            selectBackground: (style === null || style === void 0 ? void 0 : style.selectBackground) || colorRegistry_1.selectBackground,
            selectListBackground: (style === null || style === void 0 ? void 0 : style.selectListBackground) || colorRegistry_1.selectListBackground,
            selectForeground: (style === null || style === void 0 ? void 0 : style.selectForeground) || colorRegistry_1.selectForeground,
            decoratorRightForeground: (style === null || style === void 0 ? void 0 : style.pickerGroupForeground) || colorRegistry_1.pickerGroupForeground,
            selectBorder: (style === null || style === void 0 ? void 0 : style.selectBorder) || colorRegistry_1.selectBorder,
            focusBorder: (style === null || style === void 0 ? void 0 : style.focusBorder) || colorRegistry_1.focusBorder,
            listFocusBackground: (style === null || style === void 0 ? void 0 : style.listFocusBackground) || colorRegistry_1.quickInputListFocusBackground,
            listFocusForeground: (style === null || style === void 0 ? void 0 : style.listFocusForeground) || colorRegistry_1.listFocusForeground,
            listFocusOutline: (style === null || style === void 0 ? void 0 : style.listFocusOutline) || ((theme) => theme.type === theme_1.ColorScheme.HIGH_CONTRAST ? colorRegistry_1.activeContrastBorder : color_1.Color.transparent),
            listHoverBackground: (style === null || style === void 0 ? void 0 : style.listHoverBackground) || colorRegistry_1.listHoverBackground,
            listHoverForeground: (style === null || style === void 0 ? void 0 : style.listHoverForeground) || colorRegistry_1.listHoverForeground,
            listHoverOutline: (style === null || style === void 0 ? void 0 : style.listFocusOutline) || colorRegistry_1.activeContrastBorder,
            selectListBorder: (style === null || style === void 0 ? void 0 : style.selectListBorder) || colorRegistry_1.editorWidgetBorder
        }, widget);
    }
    exports.attachSelectBoxStyler = attachSelectBoxStyler;
    function attachFindReplaceInputBoxStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            inputBackground: (style === null || style === void 0 ? void 0 : style.inputBackground) || colorRegistry_1.inputBackground,
            inputForeground: (style === null || style === void 0 ? void 0 : style.inputForeground) || colorRegistry_1.inputForeground,
            inputBorder: (style === null || style === void 0 ? void 0 : style.inputBorder) || colorRegistry_1.inputBorder,
            inputActiveOptionBorder: (style === null || style === void 0 ? void 0 : style.inputActiveOptionBorder) || colorRegistry_1.inputActiveOptionBorder,
            inputActiveOptionForeground: (style === null || style === void 0 ? void 0 : style.inputActiveOptionForeground) || colorRegistry_1.inputActiveOptionForeground,
            inputActiveOptionBackground: (style === null || style === void 0 ? void 0 : style.inputActiveOptionBackground) || colorRegistry_1.inputActiveOptionBackground,
            inputValidationInfoBorder: (style === null || style === void 0 ? void 0 : style.inputValidationInfoBorder) || colorRegistry_1.inputValidationInfoBorder,
            inputValidationInfoBackground: (style === null || style === void 0 ? void 0 : style.inputValidationInfoBackground) || colorRegistry_1.inputValidationInfoBackground,
            inputValidationInfoForeground: (style === null || style === void 0 ? void 0 : style.inputValidationInfoForeground) || colorRegistry_1.inputValidationInfoForeground,
            inputValidationWarningBorder: (style === null || style === void 0 ? void 0 : style.inputValidationWarningBorder) || colorRegistry_1.inputValidationWarningBorder,
            inputValidationWarningBackground: (style === null || style === void 0 ? void 0 : style.inputValidationWarningBackground) || colorRegistry_1.inputValidationWarningBackground,
            inputValidationWarningForeground: (style === null || style === void 0 ? void 0 : style.inputValidationWarningForeground) || colorRegistry_1.inputValidationWarningForeground,
            inputValidationErrorBorder: (style === null || style === void 0 ? void 0 : style.inputValidationErrorBorder) || colorRegistry_1.inputValidationErrorBorder,
            inputValidationErrorBackground: (style === null || style === void 0 ? void 0 : style.inputValidationErrorBackground) || colorRegistry_1.inputValidationErrorBackground,
            inputValidationErrorForeground: (style === null || style === void 0 ? void 0 : style.inputValidationErrorForeground) || colorRegistry_1.inputValidationErrorForeground
        }, widget);
    }
    exports.attachFindReplaceInputBoxStyler = attachFindReplaceInputBoxStyler;
    function attachListStyler(widget, themeService, overrides) {
        return attachStyler(themeService, Object.assign(Object.assign({}, exports.defaultListStyles), (overrides || {})), widget);
    }
    exports.attachListStyler = attachListStyler;
    exports.defaultListStyles = {
        listFocusBackground: colorRegistry_1.listFocusBackground,
        listFocusForeground: colorRegistry_1.listFocusForeground,
        listFocusOutline: colorRegistry_1.listFocusOutline,
        listActiveSelectionBackground: colorRegistry_1.listActiveSelectionBackground,
        listActiveSelectionForeground: colorRegistry_1.listActiveSelectionForeground,
        listFocusAndSelectionBackground: colorRegistry_1.listActiveSelectionBackground,
        listFocusAndSelectionForeground: colorRegistry_1.listActiveSelectionForeground,
        listInactiveSelectionBackground: colorRegistry_1.listInactiveSelectionBackground,
        listInactiveSelectionForeground: colorRegistry_1.listInactiveSelectionForeground,
        listInactiveFocusBackground: colorRegistry_1.listInactiveFocusBackground,
        listInactiveFocusOutline: colorRegistry_1.listInactiveFocusOutline,
        listHoverBackground: colorRegistry_1.listHoverBackground,
        listHoverForeground: colorRegistry_1.listHoverForeground,
        listDropBackground: colorRegistry_1.listDropBackground,
        listSelectionOutline: colorRegistry_1.activeContrastBorder,
        listHoverOutline: colorRegistry_1.activeContrastBorder,
        listFilterWidgetBackground: colorRegistry_1.listFilterWidgetBackground,
        listFilterWidgetOutline: colorRegistry_1.listFilterWidgetOutline,
        listFilterWidgetNoMatchesOutline: colorRegistry_1.listFilterWidgetNoMatchesOutline,
        listMatchesShadow: colorRegistry_1.widgetShadow,
        treeIndentGuidesStroke: colorRegistry_1.treeIndentGuidesStroke,
        tableColumnsBorder: colorRegistry_1.tableColumnsBorder
    };
    function attachButtonStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            buttonForeground: (style === null || style === void 0 ? void 0 : style.buttonForeground) || colorRegistry_1.buttonForeground,
            buttonBackground: (style === null || style === void 0 ? void 0 : style.buttonBackground) || colorRegistry_1.buttonBackground,
            buttonHoverBackground: (style === null || style === void 0 ? void 0 : style.buttonHoverBackground) || colorRegistry_1.buttonHoverBackground,
            buttonSecondaryForeground: (style === null || style === void 0 ? void 0 : style.buttonSecondaryForeground) || colorRegistry_1.buttonSecondaryForeground,
            buttonSecondaryBackground: (style === null || style === void 0 ? void 0 : style.buttonSecondaryBackground) || colorRegistry_1.buttonSecondaryBackground,
            buttonSecondaryHoverBackground: (style === null || style === void 0 ? void 0 : style.buttonSecondaryHoverBackground) || colorRegistry_1.buttonSecondaryHoverBackground,
            buttonBorder: (style === null || style === void 0 ? void 0 : style.buttonBorder) || colorRegistry_1.buttonBorder,
        }, widget);
    }
    exports.attachButtonStyler = attachButtonStyler;
    function attachKeybindingLabelStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            keybindingLabelBackground: (style && style.keybindingLabelBackground) || colorRegistry_1.keybindingLabelBackground,
            keybindingLabelForeground: (style && style.keybindingLabelForeground) || colorRegistry_1.keybindingLabelForeground,
            keybindingLabelBorder: (style && style.keybindingLabelBorder) || colorRegistry_1.keybindingLabelBorder,
            keybindingLabelBottomBorder: (style && style.keybindingLabelBottomBorder) || colorRegistry_1.keybindingLabelBottomBorder,
            keybindingLabelShadow: (style && style.keybindingLabelShadow) || colorRegistry_1.widgetShadow
        }, widget);
    }
    exports.attachKeybindingLabelStyler = attachKeybindingLabelStyler;
    function attachLinkStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            textLinkForeground: (style === null || style === void 0 ? void 0 : style.textLinkForeground) || colorRegistry_1.textLinkForeground,
        }, widget);
    }
    exports.attachLinkStyler = attachLinkStyler;
    function attachProgressBarStyler(widget, themeService, style) {
        return attachStyler(themeService, {
            progressBarBackground: (style === null || style === void 0 ? void 0 : style.progressBarBackground) || colorRegistry_1.progressBarBackground
        }, widget);
    }
    exports.attachProgressBarStyler = attachProgressBarStyler;
    function attachStylerCallback(themeService, colors, callback) {
        return attachStyler(themeService, colors, callback);
    }
    exports.attachStylerCallback = attachStylerCallback;
    exports.defaultBreadcrumbsStyles = {
        breadcrumbsBackground: colorRegistry_1.breadcrumbsBackground,
        breadcrumbsForeground: colorRegistry_1.breadcrumbsForeground,
        breadcrumbsHoverForeground: colorRegistry_1.breadcrumbsFocusForeground,
        breadcrumbsFocusForeground: colorRegistry_1.breadcrumbsFocusForeground,
        breadcrumbsFocusAndSelectionForeground: colorRegistry_1.breadcrumbsActiveSelectionForeground,
    };
    function attachBreadcrumbsStyler(widget, themeService, style) {
        return attachStyler(themeService, Object.assign(Object.assign({}, exports.defaultBreadcrumbsStyles), style), widget);
    }
    exports.attachBreadcrumbsStyler = attachBreadcrumbsStyler;
    exports.defaultMenuStyles = {
        shadowColor: colorRegistry_1.widgetShadow,
        borderColor: colorRegistry_1.menuBorder,
        foregroundColor: colorRegistry_1.menuForeground,
        backgroundColor: colorRegistry_1.menuBackground,
        selectionForegroundColor: colorRegistry_1.menuSelectionForeground,
        selectionBackgroundColor: colorRegistry_1.menuSelectionBackground,
        selectionBorderColor: colorRegistry_1.menuSelectionBorder,
        separatorColor: colorRegistry_1.menuSeparatorBackground
    };
    function attachMenuStyler(widget, themeService, style) {
        return attachStyler(themeService, Object.assign(Object.assign({}, exports.defaultMenuStyles), style), widget);
    }
    exports.attachMenuStyler = attachMenuStyler;
    exports.defaultDialogStyles = {
        dialogBackground: colorRegistry_1.editorWidgetBackground,
        dialogForeground: colorRegistry_1.editorWidgetForeground,
        dialogShadow: colorRegistry_1.widgetShadow,
        dialogBorder: colorRegistry_1.contrastBorder,
        buttonForeground: colorRegistry_1.buttonForeground,
        buttonBackground: colorRegistry_1.buttonBackground,
        buttonSecondaryBackground: colorRegistry_1.buttonSecondaryBackground,
        buttonSecondaryForeground: colorRegistry_1.buttonSecondaryForeground,
        buttonSecondaryHoverBackground: colorRegistry_1.buttonSecondaryHoverBackground,
        buttonHoverBackground: colorRegistry_1.buttonHoverBackground,
        buttonBorder: colorRegistry_1.buttonBorder,
        checkboxBorder: colorRegistry_1.simpleCheckboxBorder,
        checkboxBackground: colorRegistry_1.simpleCheckboxBackground,
        checkboxForeground: colorRegistry_1.simpleCheckboxForeground,
        errorIconForeground: colorRegistry_1.problemsErrorIconForeground,
        warningIconForeground: colorRegistry_1.problemsWarningIconForeground,
        infoIconForeground: colorRegistry_1.problemsInfoIconForeground,
        inputBackground: colorRegistry_1.inputBackground,
        inputForeground: colorRegistry_1.inputForeground,
        inputBorder: colorRegistry_1.inputBorder,
        textLinkForeground: colorRegistry_1.textLinkForeground
    };
    function attachDialogStyler(widget, themeService, style) {
        return attachStyler(themeService, Object.assign(Object.assign({}, exports.defaultDialogStyles), style), widget);
    }
    exports.attachDialogStyler = attachDialogStyler;
});
//# sourceMappingURL=styler.js.map