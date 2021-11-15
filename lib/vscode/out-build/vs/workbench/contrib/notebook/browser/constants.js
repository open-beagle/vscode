/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MARKDOWN_PREVIEW_PADDING = exports.COLLAPSED_INDICATOR_HEIGHT = exports.CELL_OUTPUT_PADDING = exports.EDITOR_BOTTOM_PADDING_WITHOUT_STATUSBAR = exports.EDITOR_BOTTOM_PADDING = exports.MARKDOWN_CELL_BOTTOM_MARGIN = exports.MARKDOWN_CELL_TOP_MARGIN = exports.CELL_BOTTOM_MARGIN = exports.CELL_TOP_MARGIN = exports.CELL_STATUSBAR_HEIGHT = exports.BOTTOM_CELL_TOOLBAR_HEIGHT = exports.BOTTOM_CELL_TOOLBAR_GAP = exports.EDITOR_TOOLBAR_HEIGHT = exports.CODE_CELL_LEFT_MARGIN = exports.CELL_RUN_GUTTER = exports.CELL_RIGHT_MARGIN = exports.SCROLLABLE_ELEMENT_PADDING_TOP = void 0;
    // Scrollable Element
    exports.SCROLLABLE_ELEMENT_PADDING_TOP = 20;
    // export const SCROLLABLE_ELEMENT_PADDING_TOP_WITH_TOOLBAR = 8;
    // Code cell layout:
    // [CODE_CELL_LEFT_MARGIN][CELL_RUN_GUTTER][editorWidth][CELL_RIGHT_MARGIN]
    // Markdown cell layout:
    // [CELL_MARGIN][content][CELL_RIGHT_MARGIN]
    // Markdown editor cell layout:
    // [CODE_CELL_LEFT_MARGIN][content][CELL_RIGHT_MARGIN]
    // Cell sizing related
    exports.CELL_RIGHT_MARGIN = 16;
    exports.CELL_RUN_GUTTER = 28;
    exports.CODE_CELL_LEFT_MARGIN = 32;
    exports.EDITOR_TOOLBAR_HEIGHT = 0;
    exports.BOTTOM_CELL_TOOLBAR_GAP = 18;
    exports.BOTTOM_CELL_TOOLBAR_HEIGHT = 22;
    exports.CELL_STATUSBAR_HEIGHT = 22;
    // Margin above editor
    exports.CELL_TOP_MARGIN = 6;
    exports.CELL_BOTTOM_MARGIN = 6;
    exports.MARKDOWN_CELL_TOP_MARGIN = 8;
    exports.MARKDOWN_CELL_BOTTOM_MARGIN = 8;
    // Top and bottom padding inside the monaco editor in a cell, which are included in `cell.editorHeight`
    // export const EDITOR_TOP_PADDING = 12;
    exports.EDITOR_BOTTOM_PADDING = 4;
    exports.EDITOR_BOTTOM_PADDING_WITHOUT_STATUSBAR = 12;
    exports.CELL_OUTPUT_PADDING = 14;
    exports.COLLAPSED_INDICATOR_HEIGHT = 24;
    exports.MARKDOWN_PREVIEW_PADDING = 8;
});
//# sourceMappingURL=constants.js.map