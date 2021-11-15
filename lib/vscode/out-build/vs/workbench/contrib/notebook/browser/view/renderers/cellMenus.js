/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/platform/actions/common/actions"], function (require, exports, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellMenus = void 0;
    // TODO@roblourens Is this class overkill now?
    let CellMenus = class CellMenus {
        constructor(menuService) {
            this.menuService = menuService;
        }
        getNotebookToolbar(contextKeyService) {
            return this.getMenu(actions_1.MenuId.NotebookToolbar, contextKeyService);
        }
        getCellTitleMenu(contextKeyService) {
            return this.getMenu(actions_1.MenuId.NotebookCellTitle, contextKeyService);
        }
        getCellInsertionMenu(contextKeyService) {
            return this.getMenu(actions_1.MenuId.NotebookCellBetween, contextKeyService);
        }
        getCellTopInsertionMenu(contextKeyService) {
            return this.getMenu(actions_1.MenuId.NotebookCellListTop, contextKeyService);
        }
        getCellExecuteMenu(contextKeyService) {
            return this.getMenu(actions_1.MenuId.NotebookCellExecute, contextKeyService);
        }
        getMenu(menuId, contextKeyService) {
            const menu = this.menuService.createMenu(menuId, contextKeyService);
            return menu;
        }
    };
    CellMenus = __decorate([
        __param(0, actions_1.IMenuService)
    ], CellMenus);
    exports.CellMenus = CellMenus;
});
//# sourceMappingURL=cellMenus.js.map