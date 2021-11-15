/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/config/editorOptions", "vs/editor/common/standalone/standaloneBase", "vs/editor/standalone/browser/standaloneEditor", "vs/editor/standalone/browser/standaloneLanguages", "vs/base/common/platform", "vs/editor/contrib/format/format"], function (require, exports, editorOptions_1, standaloneBase_1, standaloneEditor_1, standaloneLanguages_1, platform_1, format_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.languages = exports.editor = exports.Token = exports.Uri = exports.MarkerTag = exports.MarkerSeverity = exports.SelectionDirection = exports.Selection = exports.Range = exports.Position = exports.KeyMod = exports.KeyCode = exports.Emitter = exports.CancellationTokenSource = void 0;
    // Set defaults for standalone editor
    editorOptions_1.EditorOptions.wrappingIndent.defaultValue = 0 /* None */;
    editorOptions_1.EditorOptions.glyphMargin.defaultValue = false;
    editorOptions_1.EditorOptions.autoIndent.defaultValue = 3 /* Advanced */;
    editorOptions_1.EditorOptions.overviewRulerLanes.defaultValue = 2;
    // We need to register a formatter selector which simply picks the first available formatter.
    // See https://github.com/microsoft/monaco-editor/issues/2327
    format_1.FormattingConflicts.setFormatterSelector((formatter, document, mode) => Promise.resolve(formatter[0]));
    const api = (0, standaloneBase_1.createMonacoBaseAPI)();
    api.editor = (0, standaloneEditor_1.createMonacoEditorAPI)();
    api.languages = (0, standaloneLanguages_1.createMonacoLanguagesAPI)();
    exports.CancellationTokenSource = api.CancellationTokenSource;
    exports.Emitter = api.Emitter;
    exports.KeyCode = api.KeyCode;
    exports.KeyMod = api.KeyMod;
    exports.Position = api.Position;
    exports.Range = api.Range;
    exports.Selection = api.Selection;
    exports.SelectionDirection = api.SelectionDirection;
    exports.MarkerSeverity = api.MarkerSeverity;
    exports.MarkerTag = api.MarkerTag;
    exports.Uri = api.Uri;
    exports.Token = api.Token;
    exports.editor = api.editor;
    exports.languages = api.languages;
    if (((_a = platform_1.globals.MonacoEnvironment) === null || _a === void 0 ? void 0 : _a.globalAPI) || (typeof define === 'function' && define.amd)) {
        self.monaco = api;
    }
    if (typeof self.require !== 'undefined' && typeof self.require.config === 'function') {
        self.require.config({
            ignoreDuplicateModules: [
                'vscode-languageserver-types',
                'vscode-languageserver-types/main',
                'vscode-languageserver-textdocument',
                'vscode-languageserver-textdocument/main',
                'vscode-nls',
                'vscode-nls/vscode-nls',
                'jsonc-parser',
                'jsonc-parser/main',
                'vscode-uri',
                'vscode-uri/index',
                'vs/basic-languages/typescript/typescript'
            ]
        });
    }
});
//# sourceMappingURL=editor.api.js.map