/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/color", "vs/base/common/event", "vs/editor/common/modes", "vs/editor/common/modes/supports/tokenization", "vs/editor/standalone/common/themes", "vs/platform/registry/common/platform", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/lifecycle", "vs/platform/theme/common/theme", "vs/platform/theme/browser/iconsStyleSheet"], function (require, exports, dom, color_1, event_1, modes_1, tokenization_1, themes_1, platform_1, colorRegistry_1, themeService_1, lifecycle_1, theme_1, iconsStyleSheet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneThemeServiceImpl = void 0;
    const VS_THEME_NAME = 'vs';
    const VS_DARK_THEME_NAME = 'vs-dark';
    const HC_BLACK_THEME_NAME = 'hc-black';
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const themingRegistry = platform_1.Registry.as(themeService_1.Extensions.ThemingContribution);
    class StandaloneTheme {
        constructor(name, standaloneThemeData) {
            this.semanticHighlighting = false;
            this.themeData = standaloneThemeData;
            let base = standaloneThemeData.base;
            if (name.length > 0) {
                if (isBuiltinTheme(name)) {
                    this.id = name;
                }
                else {
                    this.id = base + ' ' + name;
                }
                this.themeName = name;
            }
            else {
                this.id = base;
                this.themeName = base;
            }
            this.colors = null;
            this.defaultColors = Object.create(null);
            this._tokenTheme = null;
        }
        get label() {
            return this.themeName;
        }
        get base() {
            return this.themeData.base;
        }
        notifyBaseUpdated() {
            if (this.themeData.inherit) {
                this.colors = null;
                this._tokenTheme = null;
            }
        }
        getColors() {
            if (!this.colors) {
                const colors = new Map();
                for (let id in this.themeData.colors) {
                    colors.set(id, color_1.Color.fromHex(this.themeData.colors[id]));
                }
                if (this.themeData.inherit) {
                    let baseData = getBuiltinRules(this.themeData.base);
                    for (let id in baseData.colors) {
                        if (!colors.has(id)) {
                            colors.set(id, color_1.Color.fromHex(baseData.colors[id]));
                        }
                    }
                }
                this.colors = colors;
            }
            return this.colors;
        }
        getColor(colorId, useDefault) {
            const color = this.getColors().get(colorId);
            if (color) {
                return color;
            }
            if (useDefault !== false) {
                return this.getDefault(colorId);
            }
            return undefined;
        }
        getDefault(colorId) {
            let color = this.defaultColors[colorId];
            if (color) {
                return color;
            }
            color = colorRegistry.resolveDefaultColor(colorId, this);
            this.defaultColors[colorId] = color;
            return color;
        }
        defines(colorId) {
            return Object.prototype.hasOwnProperty.call(this.getColors(), colorId);
        }
        get type() {
            switch (this.base) {
                case VS_THEME_NAME: return theme_1.ColorScheme.LIGHT;
                case HC_BLACK_THEME_NAME: return theme_1.ColorScheme.HIGH_CONTRAST;
                default: return theme_1.ColorScheme.DARK;
            }
        }
        get tokenTheme() {
            if (!this._tokenTheme) {
                let rules = [];
                let encodedTokensColors = [];
                if (this.themeData.inherit) {
                    let baseData = getBuiltinRules(this.themeData.base);
                    rules = baseData.rules;
                    if (baseData.encodedTokensColors) {
                        encodedTokensColors = baseData.encodedTokensColors;
                    }
                }
                rules = rules.concat(this.themeData.rules);
                if (this.themeData.encodedTokensColors) {
                    encodedTokensColors = this.themeData.encodedTokensColors;
                }
                this._tokenTheme = tokenization_1.TokenTheme.createFromRawTokenTheme(rules, encodedTokensColors);
            }
            return this._tokenTheme;
        }
        getTokenStyleMetadata(type, modifiers, modelLanguage) {
            // use theme rules match
            const style = this.tokenTheme._match([type].concat(modifiers).join('.'));
            const metadata = style.metadata;
            const foreground = modes_1.TokenMetadata.getForeground(metadata);
            const fontStyle = modes_1.TokenMetadata.getFontStyle(metadata);
            return {
                foreground: foreground,
                italic: Boolean(fontStyle & 1 /* Italic */),
                bold: Boolean(fontStyle & 2 /* Bold */),
                underline: Boolean(fontStyle & 4 /* Underline */)
            };
        }
        get tokenColorMap() {
            return [];
        }
    }
    function isBuiltinTheme(themeName) {
        return (themeName === VS_THEME_NAME
            || themeName === VS_DARK_THEME_NAME
            || themeName === HC_BLACK_THEME_NAME);
    }
    function getBuiltinRules(builtinTheme) {
        switch (builtinTheme) {
            case VS_THEME_NAME:
                return themes_1.vs;
            case VS_DARK_THEME_NAME:
                return themes_1.vs_dark;
            case HC_BLACK_THEME_NAME:
                return themes_1.hc_black;
        }
    }
    function newBuiltInTheme(builtinTheme) {
        let themeData = getBuiltinRules(builtinTheme);
        return new StandaloneTheme(builtinTheme, themeData);
    }
    class StandaloneThemeServiceImpl extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onColorThemeChange = this._register(new event_1.Emitter());
            this.onDidColorThemeChange = this._onColorThemeChange.event;
            this._onFileIconThemeChange = this._register(new event_1.Emitter());
            this.onDidFileIconThemeChange = this._onFileIconThemeChange.event;
            this._environment = Object.create(null);
            this._autoDetectHighContrast = true;
            this._knownThemes = new Map();
            this._knownThemes.set(VS_THEME_NAME, newBuiltInTheme(VS_THEME_NAME));
            this._knownThemes.set(VS_DARK_THEME_NAME, newBuiltInTheme(VS_DARK_THEME_NAME));
            this._knownThemes.set(HC_BLACK_THEME_NAME, newBuiltInTheme(HC_BLACK_THEME_NAME));
            const iconsStyleSheet = (0, iconsStyleSheet_1.getIconsStyleSheet)();
            this._codiconCSS = iconsStyleSheet.getCSS();
            this._themeCSS = '';
            this._allCSS = `${this._codiconCSS}\n${this._themeCSS}`;
            this._globalStyleElement = null;
            this._styleElements = [];
            this._colorMapOverride = null;
            this.setTheme(VS_THEME_NAME);
            iconsStyleSheet.onDidChange(() => {
                this._codiconCSS = iconsStyleSheet.getCSS();
                this._updateCSS();
            });
            window.matchMedia('(forced-colors: active)').addEventListener('change', () => {
                this._updateActualTheme();
            });
        }
        registerEditorContainer(domNode) {
            if (dom.isInShadowDOM(domNode)) {
                return this._registerShadowDomContainer(domNode);
            }
            return this._registerRegularEditorContainer();
        }
        _registerRegularEditorContainer() {
            if (!this._globalStyleElement) {
                this._globalStyleElement = dom.createStyleSheet();
                this._globalStyleElement.className = 'monaco-colors';
                this._globalStyleElement.textContent = this._allCSS;
                this._styleElements.push(this._globalStyleElement);
            }
            return lifecycle_1.Disposable.None;
        }
        _registerShadowDomContainer(domNode) {
            const styleElement = dom.createStyleSheet(domNode);
            styleElement.className = 'monaco-colors';
            styleElement.textContent = this._allCSS;
            this._styleElements.push(styleElement);
            return {
                dispose: () => {
                    for (let i = 0; i < this._styleElements.length; i++) {
                        if (this._styleElements[i] === styleElement) {
                            this._styleElements.splice(i, 1);
                            return;
                        }
                    }
                }
            };
        }
        defineTheme(themeName, themeData) {
            if (!/^[a-z0-9\-]+$/i.test(themeName)) {
                throw new Error('Illegal theme name!');
            }
            if (!isBuiltinTheme(themeData.base) && !isBuiltinTheme(themeName)) {
                throw new Error('Illegal theme base!');
            }
            // set or replace theme
            this._knownThemes.set(themeName, new StandaloneTheme(themeName, themeData));
            if (isBuiltinTheme(themeName)) {
                this._knownThemes.forEach(theme => {
                    if (theme.base === themeName) {
                        theme.notifyBaseUpdated();
                    }
                });
            }
            if (this._theme.themeName === themeName) {
                this.setTheme(themeName); // refresh theme
            }
        }
        getColorTheme() {
            return this._theme;
        }
        setColorMapOverride(colorMapOverride) {
            this._colorMapOverride = colorMapOverride;
            this._updateThemeOrColorMap();
        }
        setTheme(themeName) {
            let theme;
            if (this._knownThemes.has(themeName)) {
                theme = this._knownThemes.get(themeName);
            }
            else {
                theme = this._knownThemes.get(VS_THEME_NAME);
            }
            this._desiredTheme = theme;
            this._updateActualTheme();
        }
        _updateActualTheme() {
            const theme = (this._autoDetectHighContrast && window.matchMedia(`(forced-colors: active)`).matches
                ? this._knownThemes.get(HC_BLACK_THEME_NAME)
                : this._desiredTheme);
            if (this._theme === theme) {
                // Nothing to do
                return;
            }
            this._theme = theme;
            this._updateThemeOrColorMap();
        }
        setAutoDetectHighContrast(autoDetectHighContrast) {
            this._autoDetectHighContrast = autoDetectHighContrast;
            this._updateActualTheme();
        }
        _updateThemeOrColorMap() {
            let cssRules = [];
            let hasRule = {};
            let ruleCollector = {
                addRule: (rule) => {
                    if (!hasRule[rule]) {
                        cssRules.push(rule);
                        hasRule[rule] = true;
                    }
                }
            };
            themingRegistry.getThemingParticipants().forEach(p => p(this._theme, ruleCollector, this._environment));
            const colorMap = this._colorMapOverride || this._theme.tokenTheme.getColorMap();
            ruleCollector.addRule((0, tokenization_1.generateTokensCSSForColorMap)(colorMap));
            this._themeCSS = cssRules.join('\n');
            this._updateCSS();
            modes_1.TokenizationRegistry.setColorMap(colorMap);
            this._onColorThemeChange.fire(this._theme);
        }
        _updateCSS() {
            this._allCSS = `${this._codiconCSS}\n${this._themeCSS}`;
            this._styleElements.forEach(styleElement => styleElement.textContent = this._allCSS);
        }
        getFileIconTheme() {
            return {
                hasFileIcons: false,
                hasFolderIcons: false,
                hidesExplorerArrows: false
            };
        }
    }
    exports.StandaloneThemeServiceImpl = StandaloneThemeServiceImpl;
});
//# sourceMappingURL=standaloneThemeServiceImpl.js.map