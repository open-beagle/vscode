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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/product/common/productService", "vs/workbench/api/common/extHostCustomers", "vs/workbench/services/credentials/common/credentials", "vs/workbench/services/encryption/common/encryptionService", "../common/extHost.protocol"], function (require, exports, lifecycle_1, productService_1, extHostCustomers_1, credentials_1, encryptionService_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadSecretState = void 0;
    let MainThreadSecretState = class MainThreadSecretState extends lifecycle_1.Disposable {
        constructor(extHostContext, credentialsService, encryptionService, productService) {
            super();
            this.credentialsService = credentialsService;
            this.encryptionService = encryptionService;
            this.productService = productService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostSecretState);
            this._register(this.credentialsService.onDidChangePassword(e => {
                const extensionId = e.service.substring(this.productService.urlProtocol.length);
                this._proxy.$onDidChangePassword({ extensionId, key: e.account });
            }));
        }
        getFullKey(extensionId) {
            return `${this.productService.urlProtocol}${extensionId}`;
        }
        async $getPassword(extensionId, key) {
            const fullKey = this.getFullKey(extensionId);
            const password = await this.credentialsService.getPassword(fullKey, key);
            const decrypted = password && await this.encryptionService.decrypt(password);
            if (decrypted) {
                try {
                    const value = JSON.parse(decrypted);
                    if (value.extensionId === extensionId) {
                        return value.content;
                    }
                }
                catch (_) {
                    throw new Error('Cannot get password');
                }
            }
            return undefined;
        }
        async $setPassword(extensionId, key, value) {
            const fullKey = this.getFullKey(extensionId);
            const toEncrypt = JSON.stringify({
                extensionId,
                content: value
            });
            const encrypted = await this.encryptionService.encrypt(toEncrypt);
            return this.credentialsService.setPassword(fullKey, key, encrypted);
        }
        async $deletePassword(extensionId, key) {
            try {
                const fullKey = this.getFullKey(extensionId);
                await this.credentialsService.deletePassword(fullKey, key);
            }
            catch (_) {
                throw new Error('Cannot delete password');
            }
        }
    };
    MainThreadSecretState = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadSecretState),
        __param(1, credentials_1.ICredentialsService),
        __param(2, encryptionService_1.IEncryptionService),
        __param(3, productService_1.IProductService)
    ], MainThreadSecretState);
    exports.MainThreadSecretState = MainThreadSecretState;
});
//# sourceMappingURL=mainThreadSecretState.js.map