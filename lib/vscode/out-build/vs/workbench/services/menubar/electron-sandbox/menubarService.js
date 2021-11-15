/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/menubar/electron-sandbox/menubar", "vs/platform/ipc/electron-sandbox/services"], function (require, exports, menubar_1, services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerMainProcessRemoteService)(menubar_1.IMenubarService, 'menubar', { supportsDelayedInstantiation: true });
});
//# sourceMappingURL=menubarService.js.map