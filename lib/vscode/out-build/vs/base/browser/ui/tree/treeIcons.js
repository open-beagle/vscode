/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons"], function (require, exports, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.treeItemLoadingIcon = exports.treeFilterClearIcon = exports.treeFilterOnTypeOffIcon = exports.treeFilterOnTypeOnIcon = exports.treeItemExpandedIcon = void 0;
    exports.treeItemExpandedIcon = (0, codicons_1.registerCodicon)('tree-item-expanded', codicons_1.Codicon.chevronDown); // collapsed is done with rotation
    exports.treeFilterOnTypeOnIcon = (0, codicons_1.registerCodicon)('tree-filter-on-type-on', codicons_1.Codicon.listFilter);
    exports.treeFilterOnTypeOffIcon = (0, codicons_1.registerCodicon)('tree-filter-on-type-off', codicons_1.Codicon.listSelection);
    exports.treeFilterClearIcon = (0, codicons_1.registerCodicon)('tree-filter-clear', codicons_1.Codicon.close);
    exports.treeItemLoadingIcon = (0, codicons_1.registerCodicon)('tree-item-loading', codicons_1.Codicon.loading);
});
//# sourceMappingURL=treeIcons.js.map