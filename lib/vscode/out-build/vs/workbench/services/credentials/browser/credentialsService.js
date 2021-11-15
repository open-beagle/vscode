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
define(["require", "exports", "vs/workbench/services/credentials/common/credentials", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, credentials_1, extensions_1, environmentService_1, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserCredentialsService = void 0;
    let BrowserCredentialsService = class BrowserCredentialsService extends lifecycle_1.Disposable {
        constructor(environmentService) {
            super();
            this._onDidChangePassword = this._register(new event_1.Emitter());
            this.onDidChangePassword = this._onDidChangePassword.event;
            if (environmentService.options && environmentService.options.credentialsProvider) {
                this.credentialsProvider = environmentService.options.credentialsProvider;
            }
            else {
                this.credentialsProvider = new InMemoryCredentialsProvider();
            }
        }
        getPassword(service, account) {
            return this.credentialsProvider.getPassword(service, account);
        }
        async setPassword(service, account, password) {
            await this.credentialsProvider.setPassword(service, account, password);
            this._onDidChangePassword.fire({ service, account });
        }
        deletePassword(service, account) {
            const didDelete = this.credentialsProvider.deletePassword(service, account);
            this._onDidChangePassword.fire({ service, account });
            return didDelete;
        }
        findPassword(service) {
            return this.credentialsProvider.findPassword(service);
        }
        findCredentials(service) {
            return this.credentialsProvider.findCredentials(service);
        }
    };
    BrowserCredentialsService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService)
    ], BrowserCredentialsService);
    exports.BrowserCredentialsService = BrowserCredentialsService;
    class InMemoryCredentialsProvider {
        constructor() {
            this.credentials = [];
        }
        async getPassword(service, account) {
            const credential = this.doFindPassword(service, account);
            return credential ? credential.password : null;
        }
        async setPassword(service, account, password) {
            this.deletePassword(service, account);
            this.credentials.push({ service, account, password });
        }
        async deletePassword(service, account) {
            const credential = this.doFindPassword(service, account);
            if (credential) {
                this.credentials = this.credentials.splice(this.credentials.indexOf(credential), 1);
            }
            return !!credential;
        }
        async findPassword(service) {
            const credential = this.doFindPassword(service);
            return credential ? credential.password : null;
        }
        doFindPassword(service, account) {
            return this.credentials.find(credential => credential.service === service && (typeof account !== 'string' || credential.account === account));
        }
        async findCredentials(service) {
            return this.credentials
                .filter(credential => credential.service === service)
                .map(({ account, password }) => ({ account, password }));
        }
    }
    (0, extensions_1.registerSingleton)(credentials_1.ICredentialsService, BrowserCredentialsService, true);
});
//# sourceMappingURL=credentialsService.js.map