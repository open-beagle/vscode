/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IContextMenuService = exports.IContextViewService = void 0;
    exports.IContextViewService = (0, instantiation_1.createDecorator)('contextViewService');
    exports.IContextMenuService = (0, instantiation_1.createDecorator)('contextMenuService');
});
//# sourceMappingURL=contextView.js.map