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
define(["require", "exports", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, network_1, path_1, platform_1, uri_1, instantiation_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractPathService = exports.IPathService = void 0;
    exports.IPathService = (0, instantiation_1.createDecorator)('pathService');
    let AbstractPathService = class AbstractPathService {
        constructor(localUserHome, remoteAgentService) {
            this.localUserHome = localUserHome;
            this.remoteAgentService = remoteAgentService;
            // OS
            this.resolveOS = (async () => {
                const env = await this.remoteAgentService.getEnvironment();
                return (env === null || env === void 0 ? void 0 : env.os) || platform_1.OS;
            })();
            // User Home
            this.resolveUserHome = (async () => {
                const env = await this.remoteAgentService.getEnvironment();
                const userHome = this.maybeUnresolvedUserHome = (env === null || env === void 0 ? void 0 : env.userHome) || localUserHome;
                return userHome;
            })();
        }
        async userHome(options) {
            return (options === null || options === void 0 ? void 0 : options.preferLocal) ? this.localUserHome : this.resolveUserHome;
        }
        get resolvedUserHome() {
            return this.maybeUnresolvedUserHome;
        }
        get path() {
            return this.resolveOS.then(os => {
                return os === 1 /* Windows */ ?
                    path_1.win32 :
                    path_1.posix;
            });
        }
        async fileURI(_path) {
            let authority = '';
            // normalize to fwd-slashes on windows,
            // on other systems bwd-slashes are valid
            // filename character, eg /f\oo/ba\r.txt
            const os = await this.resolveOS;
            if (os === 1 /* Windows */) {
                _path = _path.replace(/\\/g, '/');
            }
            // check for authority as used in UNC shares
            // or use the path as given
            if (_path[0] === '/' && _path[1] === '/') {
                const idx = _path.indexOf('/', 2);
                if (idx === -1) {
                    authority = _path.substring(2);
                    _path = '/';
                }
                else {
                    authority = _path.substring(2, idx);
                    _path = _path.substring(idx) || '/';
                }
            }
            return uri_1.URI.from({
                scheme: network_1.Schemas.file,
                authority,
                path: _path,
                query: '',
                fragment: ''
            });
        }
    };
    AbstractPathService = __decorate([
        __param(1, remoteAgentService_1.IRemoteAgentService)
    ], AbstractPathService);
    exports.AbstractPathService = AbstractPathService;
});
//# sourceMappingURL=pathService.js.map