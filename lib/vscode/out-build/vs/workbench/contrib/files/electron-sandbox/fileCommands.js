/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/network"], function (require, exports, async_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revealResourcesInOS = void 0;
    // Commands
    function revealResourcesInOS(resources, nativeHostService, workspaceContextService) {
        if (resources.length) {
            (0, async_1.sequence)(resources.map(r => async () => {
                if (r.scheme === network_1.Schemas.file || r.scheme === network_1.Schemas.userData) {
                    nativeHostService.showItemInFolder(r.fsPath);
                }
            }));
        }
        else if (workspaceContextService.getWorkspace().folders.length) {
            const uri = workspaceContextService.getWorkspace().folders[0].uri;
            if (uri.scheme === network_1.Schemas.file) {
                nativeHostService.showItemInFolder(uri.fsPath);
            }
        }
    }
    exports.revealResourcesInOS = revealResourcesInOS;
});
//# sourceMappingURL=fileCommands.js.map