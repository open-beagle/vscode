/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/search/browser/searchIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.searchNewEditorIcon = exports.searchViewIcon = exports.searchStopIcon = exports.searchClearIcon = exports.searchExpandAllIcon = exports.searchCollapseAllIcon = exports.searchRefreshIcon = exports.searchRemoveIcon = exports.searchReplaceIcon = exports.searchReplaceAllIcon = exports.searchShowReplaceIcon = exports.searchHideReplaceIcon = exports.searchShowContextIcon = exports.searchDetailsIcon = void 0;
    exports.searchDetailsIcon = (0, iconRegistry_1.registerIcon)('search-details', codicons_1.Codicon.ellipsis, (0, nls_1.localize)(0, null));
    exports.searchShowContextIcon = (0, iconRegistry_1.registerIcon)('search-show-context', codicons_1.Codicon.listSelection, (0, nls_1.localize)(1, null));
    exports.searchHideReplaceIcon = (0, iconRegistry_1.registerIcon)('search-hide-replace', codicons_1.Codicon.chevronRight, (0, nls_1.localize)(2, null));
    exports.searchShowReplaceIcon = (0, iconRegistry_1.registerIcon)('search-show-replace', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(3, null));
    exports.searchReplaceAllIcon = (0, iconRegistry_1.registerIcon)('search-replace-all', codicons_1.Codicon.replaceAll, (0, nls_1.localize)(4, null));
    exports.searchReplaceIcon = (0, iconRegistry_1.registerIcon)('search-replace', codicons_1.Codicon.replace, (0, nls_1.localize)(5, null));
    exports.searchRemoveIcon = (0, iconRegistry_1.registerIcon)('search-remove', codicons_1.Codicon.close, (0, nls_1.localize)(6, null));
    exports.searchRefreshIcon = (0, iconRegistry_1.registerIcon)('search-refresh', codicons_1.Codicon.refresh, (0, nls_1.localize)(7, null));
    exports.searchCollapseAllIcon = (0, iconRegistry_1.registerIcon)('search-collapse-results', codicons_1.Codicon.collapseAll, (0, nls_1.localize)(8, null));
    exports.searchExpandAllIcon = (0, iconRegistry_1.registerIcon)('search-expand-results', codicons_1.Codicon.expandAll, (0, nls_1.localize)(9, null));
    exports.searchClearIcon = (0, iconRegistry_1.registerIcon)('search-clear-results', codicons_1.Codicon.clearAll, (0, nls_1.localize)(10, null));
    exports.searchStopIcon = (0, iconRegistry_1.registerIcon)('search-stop', codicons_1.Codicon.searchStop, (0, nls_1.localize)(11, null));
    exports.searchViewIcon = (0, iconRegistry_1.registerIcon)('search-view-icon', codicons_1.Codicon.search, (0, nls_1.localize)(12, null));
    exports.searchNewEditorIcon = (0, iconRegistry_1.registerIcon)('search-new-editor', codicons_1.Codicon.newFile, (0, nls_1.localize)(13, null));
});
//# sourceMappingURL=searchIcons.js.map