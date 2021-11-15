/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/modes/languageConfiguration"], function (require, exports, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.javascriptOnEnterRules = void 0;
    exports.javascriptOnEnterRules = [
        {
            // e.g. /** | */
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            afterText: /^\s*\*\/$/,
            action: { indentAction: languageConfiguration_1.IndentAction.IndentOutdent, appendText: ' * ' }
        }, {
            // e.g. /** ...|
            beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: ' * ' }
        }, {
            // e.g.  * ...|
            beforeText: /^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/,
            previousLineText: /(?=^(\s*(\/\*\*|\*)).*)(?=(?!(\s*\*\/)))/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, appendText: '* ' }
        }, {
            // e.g.  */|
            beforeText: /^(\t|[ ])*[ ]\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        },
        {
            // e.g.  *-----*/|
            beforeText: /^(\t|[ ])*[ ]\*[^/]*\*\/\s*$/,
            action: { indentAction: languageConfiguration_1.IndentAction.None, removeText: 1 }
        }
    ];
});
//# sourceMappingURL=javascriptOnEnterRules.js.map