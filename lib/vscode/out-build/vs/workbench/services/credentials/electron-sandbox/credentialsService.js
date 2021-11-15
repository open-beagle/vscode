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
define(["require", "exports", "vs/workbench/services/credentials/common/credentials", "vs/platform/native/electron-sandbox/native", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, credentials_1, native_1, extensions_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeytarCredentialsService = void 0;
    let KeytarCredentialsService = class KeytarCredentialsService extends lifecycle_1.Disposable {
        constructor(nativeHostService) {
            super();
            this.nativeHostService = nativeHostService;
            this._onDidChangePassword = this._register(new event_1.Emitter());
            this.onDidChangePassword = this._onDidChangePassword.event;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.nativeHostService.onDidChangePassword(event => this._onDidChangePassword.fire(event)));
        }
        getPassword(service, account) {
            return this.nativeHostService.getPassword(service, account);
        }
        setPassword(service, account, password) {
            return this.nativeHostService.setPassword(service, account, password);
        }
        deletePassword(service, account) {
            return this.nativeHostService.deletePassword(service, account);
        }
        findPassword(service) {
            return this.nativeHostService.findPassword(service);
        }
        findCredentials(service) {
            return this.nativeHostService.findCredentials(service);
        }
    };
    KeytarCredentialsService = __decorate([
        __param(0, native_1.INativeHostService)
    ], KeytarCredentialsService);
    exports.KeytarCredentialsService = KeytarCredentialsService;
    (0, extensions_1.registerSingleton)(credentials_1.ICredentialsService, KeytarCredentialsService, true);
});
//# sourceMappingURL=credentialsService.js.map