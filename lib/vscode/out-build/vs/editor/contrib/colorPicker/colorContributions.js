/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/contrib/hover/hover", "vs/editor/common/core/range", "vs/editor/contrib/colorPicker/colorDetector"], function (require, exports, lifecycle_1, editorExtensions_1, hover_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorContribution = void 0;
    class ColorContribution extends lifecycle_1.Disposable {
        constructor(_editor) {
            super();
            this._editor = _editor;
            this._register(_editor.onMouseDown((e) => this.onMouseDown(e)));
        }
        dispose() {
            super.dispose();
        }
        onMouseDown(mouseEvent) {
            var _a;
            const targetType = mouseEvent.target.type;
            if (targetType !== 6 /* CONTENT_TEXT */) {
                return;
            }
            const hoverOnColorDecorator = [...((_a = mouseEvent.target.element) === null || _a === void 0 ? void 0 : _a.classList.values()) || []].find(className => className.startsWith('ced-colorBox'));
            if (!hoverOnColorDecorator) {
                return;
            }
            if (!mouseEvent.target.range) {
                return;
            }
            const hoverController = this._editor.getContribution(hover_1.ModesHoverController.ID);
            if (!hoverController.isColorPickerVisible()) {
                const range = new range_1.Range(mouseEvent.target.range.startLineNumber, mouseEvent.target.range.startColumn + 1, mouseEvent.target.range.endLineNumber, mouseEvent.target.range.endColumn + 1);
                hoverController.showContentHover(range, 0 /* Delayed */, false);
            }
        }
    }
    exports.ColorContribution = ColorContribution;
    ColorContribution.ID = 'editor.contrib.colorContribution';
    ColorContribution.RECOMPUTE_TIME = 1000; // ms
    (0, editorExtensions_1.registerEditorContribution)(ColorContribution.ID, ColorContribution);
});
//# sourceMappingURL=colorContributions.js.map