/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/modes/languageSelector"], function (require, exports, ls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.score = void 0;
    function _asLanguageSelector(s) {
        if (Array.isArray(s)) {
            return s.map(_asLanguageSelector);
        }
        else if (typeof s === 'string') {
            return { language: s };
        }
        else {
            const { viewType, scheme, pattern } = s;
            return { language: viewType, scheme: scheme, pattern: pattern };
        }
    }
    function score(selector, candidateUri, candidateViewType) {
        return ls.score(_asLanguageSelector(selector), candidateUri, candidateViewType, true);
    }
    exports.score = score;
});
//# sourceMappingURL=notebookSelector.js.map