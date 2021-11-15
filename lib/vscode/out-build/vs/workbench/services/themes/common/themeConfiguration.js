/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/themeConfiguration", "vs/base/common/types", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/services/themes/common/colorThemeSchema", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/tokenClassificationRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/platform"], function (require, exports, nls, types, platform_1, configurationRegistry_1, colorThemeSchema_1, colorRegistry_1, tokenClassificationRegistry_1, workbenchThemeService_1, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeConfiguration = exports.updateProductIconThemeConfigurationSchemas = exports.updateFileIconThemeConfigurationSchemas = exports.updateColorThemeConfigurationSchemas = exports.DEFAULT_PRODUCT_ICON_THEME_SETTING_VALUE = void 0;
    const DEFAULT_THEME_DARK_SETTING_VALUE = 'Default Dark+';
    const DEFAULT_THEME_LIGHT_SETTING_VALUE = 'Default Light+';
    const DEFAULT_THEME_HC_SETTING_VALUE = 'Default High Contrast';
    const DEFAULT_FILE_ICON_THEME_SETTING_VALUE = 'vs-seti';
    exports.DEFAULT_PRODUCT_ICON_THEME_SETTING_VALUE = 'Default';
    // Configuration: Themes
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const colorThemeSettingEnum = [];
    const colorThemeSettingEnumItemLabels = [];
    const colorThemeSettingEnumDescriptions = [];
    const colorThemeSettingSchema = {
        type: 'string',
        description: nls.localize(0, null),
        default: platform_2.isWeb ? DEFAULT_THEME_LIGHT_SETTING_VALUE : DEFAULT_THEME_DARK_SETTING_VALUE,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(1, null),
    };
    const preferredDarkThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(2, null, workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME),
        default: DEFAULT_THEME_DARK_SETTING_VALUE,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(3, null),
    };
    const preferredLightThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(4, null, workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME),
        default: DEFAULT_THEME_LIGHT_SETTING_VALUE,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        errorMessage: nls.localize(5, null),
    };
    const preferredHCThemeSettingSchema = {
        type: 'string',
        markdownDescription: nls.localize(6, null, workbenchThemeService_1.ThemeSettings.DETECT_HC),
        default: DEFAULT_THEME_HC_SETTING_VALUE,
        enum: colorThemeSettingEnum,
        enumDescriptions: colorThemeSettingEnumDescriptions,
        enumItemLabels: colorThemeSettingEnumItemLabels,
        included: platform_2.isWindows || platform_2.isMacintosh,
        errorMessage: nls.localize(7, null),
    };
    const detectColorSchemeSettingSchema = {
        type: 'boolean',
        markdownDescription: nls.localize(8, null, workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME, workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME),
        default: false
    };
    const colorCustomizationsSchema = {
        type: 'object',
        description: nls.localize(9, null),
        allOf: [{ $ref: colorRegistry_1.workbenchColorsSchemaId }],
        default: {},
        defaultSnippets: [{
                body: {}
            }]
    };
    const fileIconThemeSettingSchema = {
        type: ['string', 'null'],
        default: DEFAULT_FILE_ICON_THEME_SETTING_VALUE,
        description: nls.localize(10, null),
        enum: [null],
        enumItemLabels: [nls.localize(11, null)],
        enumDescriptions: [nls.localize(12, null)],
        errorMessage: nls.localize(13, null)
    };
    const productIconThemeSettingSchema = {
        type: ['string', 'null'],
        default: exports.DEFAULT_PRODUCT_ICON_THEME_SETTING_VALUE,
        description: nls.localize(14, null),
        enum: [exports.DEFAULT_PRODUCT_ICON_THEME_SETTING_VALUE],
        enumItemLabels: [nls.localize(15, null)],
        enumDescriptions: [nls.localize(16, null)],
        errorMessage: nls.localize(17, null)
    };
    const detectHCSchemeSettingSchema = {
        type: 'boolean',
        default: true,
        markdownDescription: nls.localize(18, null, workbenchThemeService_1.ThemeSettings.PREFERRED_HC_THEME),
        scope: 1 /* APPLICATION */
    };
    const themeSettingsConfiguration = {
        id: 'workbench',
        order: 7.1,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.COLOR_THEME]: colorThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_DARK_THEME]: preferredDarkThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_LIGHT_THEME]: preferredLightThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.PREFERRED_HC_THEME]: preferredHCThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME]: fileIconThemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS]: colorCustomizationsSchema,
            [workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME]: productIconThemeSettingSchema
        }
    };
    configurationRegistry.registerConfiguration(themeSettingsConfiguration);
    const themeSettingsWindowConfiguration = {
        id: 'window',
        order: 8.1,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.DETECT_HC]: detectHCSchemeSettingSchema,
            [workbenchThemeService_1.ThemeSettings.DETECT_COLOR_SCHEME]: detectColorSchemeSettingSchema,
        }
    };
    configurationRegistry.registerConfiguration(themeSettingsWindowConfiguration);
    function tokenGroupSettings(description) {
        return {
            description,
            $ref: colorThemeSchema_1.textmateColorGroupSchemaId
        };
    }
    const tokenColorSchema = {
        properties: {
            comments: tokenGroupSettings(nls.localize(19, null)),
            strings: tokenGroupSettings(nls.localize(20, null)),
            keywords: tokenGroupSettings(nls.localize(21, null)),
            numbers: tokenGroupSettings(nls.localize(22, null)),
            types: tokenGroupSettings(nls.localize(23, null)),
            functions: tokenGroupSettings(nls.localize(24, null)),
            variables: tokenGroupSettings(nls.localize(25, null)),
            textMateRules: {
                description: nls.localize(26, null),
                $ref: colorThemeSchema_1.textmateColorsSchemaId
            },
            semanticHighlighting: {
                description: nls.localize(27, null),
                deprecationMessage: nls.localize(28, null),
                markdownDeprecationMessage: nls.localize(29, null),
                type: 'boolean'
            }
        }
    };
    const tokenColorCustomizationSchema = {
        description: nls.localize(30, null),
        default: {},
        allOf: [tokenColorSchema]
    };
    const semanticTokenColorSchema = {
        type: 'object',
        properties: {
            enabled: {
                type: 'boolean',
                description: nls.localize(31, null),
                suggestSortText: '0_enabled'
            },
            rules: {
                $ref: tokenClassificationRegistry_1.tokenStylingSchemaId,
                description: nls.localize(32, null),
                suggestSortText: '0_rules'
            }
        },
        additionalProperties: false
    };
    const semanticTokenColorCustomizationSchema = {
        description: nls.localize(33, null),
        default: {},
        allOf: [Object.assign(Object.assign({}, semanticTokenColorSchema), { patternProperties: { '^\\[': {} } })]
    };
    const experimentalTokenStylingCustomizationSchema = {
        deprecationMessage: nls.localize(34, null),
        markdownDeprecationMessage: nls.localize(35, null),
        default: {},
        allOf: [{ $ref: tokenClassificationRegistry_1.tokenStylingSchemaId }],
    };
    const tokenColorCustomizationConfiguration = {
        id: 'editor',
        order: 7.2,
        type: 'object',
        properties: {
            [workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS]: tokenColorCustomizationSchema,
            [workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS]: semanticTokenColorCustomizationSchema,
            [workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS_EXPERIMENTAL]: experimentalTokenStylingCustomizationSchema
        }
    };
    configurationRegistry.registerConfiguration(tokenColorCustomizationConfiguration);
    function updateColorThemeConfigurationSchemas(themes) {
        // updates enum for the 'workbench.colorTheme` setting
        colorThemeSettingEnum.splice(0, colorThemeSettingEnum.length, ...themes.map(t => t.settingsId));
        colorThemeSettingEnumDescriptions.splice(0, colorThemeSettingEnumDescriptions.length, ...themes.map(t => t.description || ''));
        colorThemeSettingEnumItemLabels.splice(0, colorThemeSettingEnumItemLabels.length, ...themes.map(t => t.label || ''));
        const themeSpecificWorkbenchColors = { properties: {} };
        const themeSpecificTokenColors = { properties: {} };
        const themeSpecificSemanticTokenColors = { properties: {} };
        const experimentalThemeSpecificSemanticTokenColors = { properties: {} };
        const workbenchColors = { $ref: colorRegistry_1.workbenchColorsSchemaId, additionalProperties: false };
        const tokenColors = { properties: tokenColorSchema.properties, additionalProperties: false };
        for (let t of themes) {
            // add theme specific color customization ("[Abyss]":{ ... })
            const themeId = `[${t.settingsId}]`;
            themeSpecificWorkbenchColors.properties[themeId] = workbenchColors;
            themeSpecificTokenColors.properties[themeId] = tokenColors;
            themeSpecificSemanticTokenColors.properties[themeId] = semanticTokenColorSchema;
            experimentalThemeSpecificSemanticTokenColors.properties[themeId] = { $ref: tokenClassificationRegistry_1.tokenStylingSchemaId, additionalProperties: false };
        }
        colorCustomizationsSchema.allOf[1] = themeSpecificWorkbenchColors;
        tokenColorCustomizationSchema.allOf[1] = themeSpecificTokenColors;
        semanticTokenColorCustomizationSchema.allOf[1] = themeSpecificSemanticTokenColors;
        experimentalTokenStylingCustomizationSchema.allOf[1] = experimentalThemeSpecificSemanticTokenColors;
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration, tokenColorCustomizationConfiguration);
    }
    exports.updateColorThemeConfigurationSchemas = updateColorThemeConfigurationSchemas;
    function updateFileIconThemeConfigurationSchemas(themes) {
        fileIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map(t => t.settingsId));
        fileIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map(t => t.label));
        fileIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map(t => t.description || ''));
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
    }
    exports.updateFileIconThemeConfigurationSchemas = updateFileIconThemeConfigurationSchemas;
    function updateProductIconThemeConfigurationSchemas(themes) {
        productIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map(t => t.settingsId));
        productIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map(t => t.label));
        productIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map(t => t.description || ''));
        configurationRegistry.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
    }
    exports.updateProductIconThemeConfigurationSchemas = updateProductIconThemeConfigurationSchemas;
    class ThemeConfiguration {
        constructor(configurationService) {
            this.configurationService = configurationService;
        }
        get colorTheme() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.COLOR_THEME);
        }
        get fileIconTheme() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME);
        }
        get productIconTheme() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME);
        }
        get colorCustomizations() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.COLOR_CUSTOMIZATIONS) || {};
        }
        get tokenColorCustomizations() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS) || {};
        }
        get semanticTokenColorCustomizations() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS);
        }
        get experimentalSemanticTokenColorCustomizations() {
            return this.configurationService.getValue(workbenchThemeService_1.ThemeSettings.TOKEN_COLOR_CUSTOMIZATIONS_EXPERIMENTAL);
        }
        async setColorTheme(theme, settingsTarget) {
            await this.writeConfiguration(workbenchThemeService_1.ThemeSettings.COLOR_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        async setFileIconTheme(theme, settingsTarget) {
            await this.writeConfiguration(workbenchThemeService_1.ThemeSettings.FILE_ICON_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        async setProductIconTheme(theme, settingsTarget) {
            await this.writeConfiguration(workbenchThemeService_1.ThemeSettings.PRODUCT_ICON_THEME, theme.settingsId, settingsTarget);
            return theme;
        }
        isDefaultColorTheme() {
            var _a;
            let settings = this.configurationService.inspect(workbenchThemeService_1.ThemeSettings.COLOR_THEME);
            return settings && ((_a = settings.default) === null || _a === void 0 ? void 0 : _a.value) === settings.value;
        }
        findAutoConfigurationTarget(key) {
            let settings = this.configurationService.inspect(key);
            if (!types.isUndefined(settings.workspaceFolderValue)) {
                return 5 /* WORKSPACE_FOLDER */;
            }
            else if (!types.isUndefined(settings.workspaceValue)) {
                return 4 /* WORKSPACE */;
            }
            else if (!types.isUndefined(settings.userRemote)) {
                return 3 /* USER_REMOTE */;
            }
            return 1 /* USER */;
        }
        async writeConfiguration(key, value, settingsTarget) {
            if (settingsTarget === undefined) {
                return;
            }
            let settings = this.configurationService.inspect(key);
            if (settingsTarget === 'auto') {
                return this.configurationService.updateValue(key, value);
            }
            if (settingsTarget === 1 /* USER */) {
                if (value === settings.userValue) {
                    return Promise.resolve(undefined); // nothing to do
                }
                else if (value === settings.defaultValue) {
                    if (types.isUndefined(settings.userValue)) {
                        return Promise.resolve(undefined); // nothing to do
                    }
                    value = undefined; // remove configuration from user settings
                }
            }
            else if (settingsTarget === 4 /* WORKSPACE */ || settingsTarget === 5 /* WORKSPACE_FOLDER */ || settingsTarget === 3 /* USER_REMOTE */) {
                if (value === settings.value) {
                    return Promise.resolve(undefined); // nothing to do
                }
            }
            return this.configurationService.updateValue(key, value, settingsTarget);
        }
    }
    exports.ThemeConfiguration = ThemeConfiguration;
});
//# sourceMappingURL=themeConfiguration.js.map