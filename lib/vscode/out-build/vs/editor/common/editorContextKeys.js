/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorContextKeys = void 0;
    var EditorContextKeys;
    (function (EditorContextKeys) {
        EditorContextKeys.editorSimpleInput = new contextkey_1.RawContextKey('editorSimpleInput', false, true);
        /**
         * A context key that is set when the editor's text has focus (cursor is blinking).
         * Is false when focus is in simple editor widgets (repl input, scm commit input).
         */
        EditorContextKeys.editorTextFocus = new contextkey_1.RawContextKey('editorTextFocus', false, nls.localize(0, null));
        /**
         * A context key that is set when the editor's text or an editor's widget has focus.
         */
        EditorContextKeys.focus = new contextkey_1.RawContextKey('editorFocus', false, nls.localize(1, null));
        /**
         * A context key that is set when any editor input has focus (regular editor, repl input...).
         */
        EditorContextKeys.textInputFocus = new contextkey_1.RawContextKey('textInputFocus', false, nls.localize(2, null));
        EditorContextKeys.readOnly = new contextkey_1.RawContextKey('editorReadonly', false, nls.localize(3, null));
        EditorContextKeys.inDiffEditor = new contextkey_1.RawContextKey('inDiffEditor', false, nls.localize(4, null));
        EditorContextKeys.columnSelection = new contextkey_1.RawContextKey('editorColumnSelection', false, nls.localize(5, null));
        EditorContextKeys.writable = EditorContextKeys.readOnly.toNegated();
        EditorContextKeys.hasNonEmptySelection = new contextkey_1.RawContextKey('editorHasSelection', false, nls.localize(6, null));
        EditorContextKeys.hasOnlyEmptySelection = EditorContextKeys.hasNonEmptySelection.toNegated();
        EditorContextKeys.hasMultipleSelections = new contextkey_1.RawContextKey('editorHasMultipleSelections', false, nls.localize(7, null));
        EditorContextKeys.hasSingleSelection = EditorContextKeys.hasMultipleSelections.toNegated();
        EditorContextKeys.tabMovesFocus = new contextkey_1.RawContextKey('editorTabMovesFocus', false, nls.localize(8, null));
        EditorContextKeys.tabDoesNotMoveFocus = EditorContextKeys.tabMovesFocus.toNegated();
        EditorContextKeys.isInWalkThroughSnippet = new contextkey_1.RawContextKey('isInEmbeddedEditor', false, true);
        EditorContextKeys.canUndo = new contextkey_1.RawContextKey('canUndo', false, true);
        EditorContextKeys.canRedo = new contextkey_1.RawContextKey('canRedo', false, true);
        EditorContextKeys.hoverVisible = new contextkey_1.RawContextKey('editorHoverVisible', false, nls.localize(9, null));
        /**
         * A context key that is set when an editor is part of a larger editor, like notebooks or
         * (future) a diff editor
         */
        EditorContextKeys.inCompositeEditor = new contextkey_1.RawContextKey('inCompositeEditor', undefined, nls.localize(10, null));
        EditorContextKeys.notInCompositeEditor = EditorContextKeys.inCompositeEditor.toNegated();
        // -- mode context keys
        EditorContextKeys.languageId = new contextkey_1.RawContextKey('editorLangId', '', nls.localize(11, null));
        EditorContextKeys.hasCompletionItemProvider = new contextkey_1.RawContextKey('editorHasCompletionItemProvider', false, nls.localize(12, null));
        EditorContextKeys.hasCodeActionsProvider = new contextkey_1.RawContextKey('editorHasCodeActionsProvider', false, nls.localize(13, null));
        EditorContextKeys.hasCodeLensProvider = new contextkey_1.RawContextKey('editorHasCodeLensProvider', false, nls.localize(14, null));
        EditorContextKeys.hasDefinitionProvider = new contextkey_1.RawContextKey('editorHasDefinitionProvider', false, nls.localize(15, null));
        EditorContextKeys.hasDeclarationProvider = new contextkey_1.RawContextKey('editorHasDeclarationProvider', false, nls.localize(16, null));
        EditorContextKeys.hasImplementationProvider = new contextkey_1.RawContextKey('editorHasImplementationProvider', false, nls.localize(17, null));
        EditorContextKeys.hasTypeDefinitionProvider = new contextkey_1.RawContextKey('editorHasTypeDefinitionProvider', false, nls.localize(18, null));
        EditorContextKeys.hasHoverProvider = new contextkey_1.RawContextKey('editorHasHoverProvider', false, nls.localize(19, null));
        EditorContextKeys.hasDocumentHighlightProvider = new contextkey_1.RawContextKey('editorHasDocumentHighlightProvider', false, nls.localize(20, null));
        EditorContextKeys.hasDocumentSymbolProvider = new contextkey_1.RawContextKey('editorHasDocumentSymbolProvider', false, nls.localize(21, null));
        EditorContextKeys.hasReferenceProvider = new contextkey_1.RawContextKey('editorHasReferenceProvider', false, nls.localize(22, null));
        EditorContextKeys.hasRenameProvider = new contextkey_1.RawContextKey('editorHasRenameProvider', false, nls.localize(23, null));
        EditorContextKeys.hasSignatureHelpProvider = new contextkey_1.RawContextKey('editorHasSignatureHelpProvider', false, nls.localize(24, null));
        EditorContextKeys.hasInlineHintsProvider = new contextkey_1.RawContextKey('editorHasInlineHintsProvider', false, nls.localize(25, null));
        // -- mode context keys: formatting
        EditorContextKeys.hasDocumentFormattingProvider = new contextkey_1.RawContextKey('editorHasDocumentFormattingProvider', false, nls.localize(26, null));
        EditorContextKeys.hasDocumentSelectionFormattingProvider = new contextkey_1.RawContextKey('editorHasDocumentSelectionFormattingProvider', false, nls.localize(27, null));
        EditorContextKeys.hasMultipleDocumentFormattingProvider = new contextkey_1.RawContextKey('editorHasMultipleDocumentFormattingProvider', false, nls.localize(28, null));
        EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider = new contextkey_1.RawContextKey('editorHasMultipleDocumentSelectionFormattingProvider', false, nls.localize(29, null));
    })(EditorContextKeys = exports.EditorContextKeys || (exports.EditorContextKeys = {}));
});
//# sourceMappingURL=editorContextKeys.js.map