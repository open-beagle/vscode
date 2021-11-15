/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/quickAccess/gotoLineQuickAccess", "vs/base/common/lifecycle", "vs/editor/contrib/quickAccess/editorNavigationQuickAccess", "vs/editor/browser/editorBrowser"], function (require, exports, nls_1, lifecycle_1, editorNavigationQuickAccess_1, editorBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractGotoLineQuickAccessProvider = void 0;
    class AbstractGotoLineQuickAccessProvider extends editorNavigationQuickAccess_1.AbstractEditorNavigationQuickAccessProvider {
        constructor() {
            super({ canAcceptInBackground: true });
        }
        provideWithoutTextEditor(picker) {
            const label = (0, nls_1.localize)(0, null);
            picker.items = [{ label }];
            picker.ariaLabel = label;
            return lifecycle_1.Disposable.None;
        }
        provideWithTextEditor(context, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.DisposableStore();
            // Goto line once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item) {
                    if (!this.isValidLineNumber(editor, item.lineNumber)) {
                        return;
                    }
                    this.gotoLocation(context, { range: this.toRange(item.lineNumber, item.column), keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // React to picker changes
            const updatePickerAndEditor = () => {
                const position = this.parsePosition(editor, picker.value.trim().substr(AbstractGotoLineQuickAccessProvider.PREFIX.length));
                const label = this.getPickLabel(editor, position.lineNumber, position.column);
                // Picker
                picker.items = [{
                        lineNumber: position.lineNumber,
                        column: position.column,
                        label
                    }];
                // ARIA Label
                picker.ariaLabel = label;
                // Clear decorations for invalid range
                if (!this.isValidLineNumber(editor, position.lineNumber)) {
                    this.clearDecorations(editor);
                    return;
                }
                // Reveal
                const range = this.toRange(position.lineNumber, position.column);
                editor.revealRangeInCenter(range, 0 /* Smooth */);
                // Decorate
                this.addDecorations(editor, range);
            };
            updatePickerAndEditor();
            disposables.add(picker.onDidChangeValue(() => updatePickerAndEditor()));
            // Adjust line number visibility as needed
            const codeEditor = (0, editorBrowser_1.getCodeEditor)(editor);
            if (codeEditor) {
                const options = codeEditor.getOptions();
                const lineNumbers = options.get(56 /* lineNumbers */);
                if (lineNumbers.renderType === 2 /* Relative */) {
                    codeEditor.updateOptions({ lineNumbers: 'on' });
                    disposables.add((0, lifecycle_1.toDisposable)(() => codeEditor.updateOptions({ lineNumbers: 'relative' })));
                }
            }
            return disposables;
        }
        toRange(lineNumber = 1, column = 1) {
            return {
                startLineNumber: lineNumber,
                startColumn: column,
                endLineNumber: lineNumber,
                endColumn: column
            };
        }
        parsePosition(editor, value) {
            // Support line-col formats of `line,col`, `line:col`, `line#col`
            const numbers = value.split(/,|:|#/).map(part => parseInt(part, 10)).filter(part => !isNaN(part));
            const endLine = this.lineCount(editor) + 1;
            return {
                lineNumber: numbers[0] > 0 ? numbers[0] : endLine + numbers[0],
                column: numbers[1]
            };
        }
        getPickLabel(editor, lineNumber, column) {
            // Location valid: indicate this as picker label
            if (this.isValidLineNumber(editor, lineNumber)) {
                if (this.isValidColumn(editor, lineNumber, column)) {
                    return (0, nls_1.localize)(1, null, lineNumber, column);
                }
                return (0, nls_1.localize)(2, null, lineNumber);
            }
            // Location invalid: show generic label
            const position = editor.getPosition() || { lineNumber: 1, column: 1 };
            const lineCount = this.lineCount(editor);
            if (lineCount > 1) {
                return (0, nls_1.localize)(3, null, position.lineNumber, position.column, lineCount);
            }
            return (0, nls_1.localize)(4, null, position.lineNumber, position.column);
        }
        isValidLineNumber(editor, lineNumber) {
            if (!lineNumber || typeof lineNumber !== 'number') {
                return false;
            }
            return lineNumber > 0 && lineNumber <= this.lineCount(editor);
        }
        isValidColumn(editor, lineNumber, column) {
            if (!column || typeof column !== 'number') {
                return false;
            }
            const model = this.getModel(editor);
            if (!model) {
                return false;
            }
            const positionCandidate = { lineNumber, column };
            return model.validatePosition(positionCandidate).equals(positionCandidate);
        }
        lineCount(editor) {
            var _a, _b;
            return (_b = (_a = this.getModel(editor)) === null || _a === void 0 ? void 0 : _a.getLineCount()) !== null && _b !== void 0 ? _b : 0;
        }
    }
    exports.AbstractGotoLineQuickAccessProvider = AbstractGotoLineQuickAccessProvider;
    AbstractGotoLineQuickAccessProvider.PREFIX = ':';
});
//# sourceMappingURL=gotoLineQuickAccess.js.map