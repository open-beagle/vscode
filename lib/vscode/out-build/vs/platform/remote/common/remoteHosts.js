/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getVirtualWorkspaceScheme = exports.getVirtualWorkspaceLocation = exports.getRemoteName = exports.getRemoteAuthority = void 0;
    function getRemoteAuthority(uri) {
        return uri.scheme === network_1.Schemas.vscodeRemote ? uri.authority : undefined;
    }
    exports.getRemoteAuthority = getRemoteAuthority;
    function getRemoteName(authority) {
        if (!authority) {
            return undefined;
        }
        const pos = authority.indexOf('+');
        if (pos < 0) {
            // e.g. localhost:8000
            return authority;
        }
        return authority.substr(0, pos);
    }
    exports.getRemoteName = getRemoteName;
    function isVirtualResource(resource) {
        return resource.scheme !== network_1.Schemas.file && resource.scheme !== network_1.Schemas.vscodeRemote;
    }
    function getVirtualWorkspaceLocation(workspace) {
        if (workspace.folders.length) {
            return workspace.folders.every(f => isVirtualResource(f.uri)) ? workspace.folders[0].uri : undefined;
        }
        else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
            return workspace.configuration;
        }
        return undefined;
    }
    exports.getVirtualWorkspaceLocation = getVirtualWorkspaceLocation;
    function getVirtualWorkspaceScheme(workspace) {
        var _a;
        return (_a = getVirtualWorkspaceLocation(workspace)) === null || _a === void 0 ? void 0 : _a.scheme;
    }
    exports.getVirtualWorkspaceScheme = getVirtualWorkspaceScheme;
});
//# sourceMappingURL=remoteHosts.js.map