/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/color", "vs/platform/theme/common/theme"], function (require, exports, event_1, color_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestThemeService = exports.TestFileIconTheme = exports.TestColorTheme = void 0;
    class TestColorTheme {
        constructor(colors = {}, type = theme_1.ColorScheme.DARK, semanticHighlighting = false) {
            this.colors = colors;
            this.type = type;
            this.semanticHighlighting = semanticHighlighting;
            this.label = 'test';
        }
        getColor(color, useDefault) {
            let value = this.colors[color];
            if (value) {
                return color_1.Color.fromHex(value);
            }
            return undefined;
        }
        defines(color) {
            throw new Error('Method not implemented.');
        }
        getTokenStyleMetadata(type, modifiers, modelLanguage) {
            return undefined;
        }
        get tokenColorMap() {
            return [];
        }
    }
    exports.TestColorTheme = TestColorTheme;
    class TestFileIconTheme {
        constructor() {
            this.hasFileIcons = false;
            this.hasFolderIcons = false;
            this.hidesExplorerArrows = false;
        }
    }
    exports.TestFileIconTheme = TestFileIconTheme;
    class TestThemeService {
        constructor(theme = new TestColorTheme(), iconTheme = new TestFileIconTheme()) {
            this._onThemeChange = new event_1.Emitter();
            this._onFileIconThemeChange = new event_1.Emitter();
            this._colorTheme = theme;
            this._fileIconTheme = iconTheme;
        }
        getColorTheme() {
            return this._colorTheme;
        }
        setTheme(theme) {
            this._colorTheme = theme;
            this.fireThemeChange();
        }
        fireThemeChange() {
            this._onThemeChange.fire(this._colorTheme);
        }
        get onDidColorThemeChange() {
            return this._onThemeChange.event;
        }
        getFileIconTheme() {
            return this._fileIconTheme;
        }
        get onDidFileIconThemeChange() {
            return this._onFileIconThemeChange.event;
        }
    }
    exports.TestThemeService = TestThemeService;
});
//# sourceMappingURL=testThemeService.js.map