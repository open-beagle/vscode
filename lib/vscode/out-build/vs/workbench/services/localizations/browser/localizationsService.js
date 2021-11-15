/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coder Technologies. All rights reserved.
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
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/platform/instantiation/common/extensions", "vs/platform/localizations/common/localizations", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, ipc_1, extensions_1, localizations_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalizationsService = void 0;
    // @ts-ignore: interface is implemented via proxy
    let LocalizationsService = class LocalizationsService {
        constructor(remoteAgentService) {
            return ipc_1.ProxyChannel.toService(remoteAgentService.getConnection().getChannel('localizations'));
        }
    };
    LocalizationsService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService)
    ], LocalizationsService);
    exports.LocalizationsService = LocalizationsService;
    (0, extensions_1.registerSingleton)(localizations_1.ILocalizationsService, LocalizationsService, true);
});
//# sourceMappingURL=localizationsService.js.map