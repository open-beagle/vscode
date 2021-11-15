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
define(["require", "exports", "vs/base/common/lifecycle", "vs/nls!vs/workbench/api/browser/mainThreadAuthentication", "vs/workbench/api/common/extHostCustomers", "vs/workbench/services/authentication/browser/authenticationService", "../common/extHost.protocol", "vs/platform/dialogs/common/dialogs", "vs/platform/storage/common/storage", "vs/base/common/severity", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/base/common/date", "vs/workbench/services/extensions/common/extensions"], function (require, exports, lifecycle_1, nls, extHostCustomers_1, authenticationService_1, extHost_protocol_1, dialogs_1, storage_1, severity_1, quickInput_1, notification_1, date_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadAuthentication = exports.MainThreadAuthenticationProvider = void 0;
    class MainThreadAuthenticationProvider extends lifecycle_1.Disposable {
        constructor(_proxy, id, label, supportsMultipleAccounts, notificationService, storageService, quickInputService, dialogService) {
            super();
            this._proxy = _proxy;
            this.id = id;
            this.label = label;
            this.supportsMultipleAccounts = supportsMultipleAccounts;
            this.notificationService = notificationService;
            this.storageService = storageService;
            this.quickInputService = quickInputService;
            this.dialogService = dialogService;
        }
        manageTrustedExtensions(accountName) {
            const allowedExtensions = (0, authenticationService_1.readAllowedExtensions)(this.storageService, this.id, accountName);
            if (!allowedExtensions.length) {
                this.dialogService.show(severity_1.default.Info, nls.localize(0, null), []);
                return;
            }
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.canSelectMany = true;
            const usages = (0, authenticationService_1.readAccountUsages)(this.storageService, this.id, accountName);
            const items = allowedExtensions.map(extension => {
                const usage = usages.find(usage => extension.id === usage.extensionId);
                return {
                    label: extension.name,
                    description: usage
                        ? nls.localize(1, null, (0, date_1.fromNow)(usage.lastUsed, true))
                        : nls.localize(2, null),
                    extension
                };
            });
            quickPick.items = items;
            quickPick.selectedItems = items.filter(item => item.extension.allowed === undefined || item.extension.allowed);
            quickPick.title = nls.localize(3, null);
            quickPick.placeholder = nls.localize(4, null);
            quickPick.onDidAccept(() => {
                const updatedAllowedList = quickPick.selectedItems.map(item => item.extension);
                this.storageService.store(`${this.id}-${accountName}`, JSON.stringify(updatedAllowedList), 0 /* GLOBAL */, 0 /* USER */);
                quickPick.dispose();
            });
            quickPick.onDidHide(() => {
                quickPick.dispose();
            });
            quickPick.show();
        }
        async removeAccountSessions(accountName, sessions) {
            const accountUsages = (0, authenticationService_1.readAccountUsages)(this.storageService, this.id, accountName);
            const result = await this.dialogService.show(severity_1.default.Info, accountUsages.length
                ? nls.localize(5, null, accountName, accountUsages.map(usage => usage.extensionName).join('\n'))
                : nls.localize(6, null, accountName), [
                nls.localize(7, null),
                nls.localize(8, null)
            ], {
                cancelId: 1
            });
            if (result.choice === 0) {
                const removeSessionPromises = sessions.map(session => this.removeSession(session.id));
                await Promise.all(removeSessionPromises);
                (0, authenticationService_1.removeAccountUsage)(this.storageService, this.id, accountName);
                this.storageService.remove(`${this.id}-${accountName}`, 0 /* GLOBAL */);
            }
        }
        async getSessions(scopes) {
            return this._proxy.$getSessions(this.id, scopes);
        }
        createSession(scopes) {
            return this._proxy.$createSession(this.id, scopes);
        }
        async removeSession(sessionId) {
            await this._proxy.$removeSession(this.id, sessionId);
            this.notificationService.info(nls.localize(9, null));
        }
    }
    exports.MainThreadAuthenticationProvider = MainThreadAuthenticationProvider;
    let MainThreadAuthentication = class MainThreadAuthentication extends lifecycle_1.Disposable {
        constructor(extHostContext, authenticationService, dialogService, storageService, notificationService, quickInputService, extensionService) {
            super();
            this.authenticationService = authenticationService;
            this.dialogService = dialogService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.quickInputService = quickInputService;
            this.extensionService = extensionService;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostAuthentication);
            this._register(this.authenticationService.onDidChangeSessions(e => {
                this._proxy.$onDidChangeAuthenticationSessions(e.providerId, e.label);
            }));
            this._register(this.authenticationService.onDidRegisterAuthenticationProvider(info => {
                this._proxy.$onDidChangeAuthenticationProviders([info], []);
            }));
            this._register(this.authenticationService.onDidUnregisterAuthenticationProvider(info => {
                this._proxy.$onDidChangeAuthenticationProviders([], [info]);
            }));
            this._proxy.$setProviders(this.authenticationService.declaredProviders);
            this._register(this.authenticationService.onDidChangeDeclaredProviders(e => {
                this._proxy.$setProviders(e);
            }));
        }
        async $registerAuthenticationProvider(id, label, supportsMultipleAccounts) {
            const provider = new MainThreadAuthenticationProvider(this._proxy, id, label, supportsMultipleAccounts, this.notificationService, this.storageService, this.quickInputService, this.dialogService);
            this.authenticationService.registerAuthenticationProvider(id, provider);
        }
        $unregisterAuthenticationProvider(id) {
            this.authenticationService.unregisterAuthenticationProvider(id);
        }
        $ensureProvider(id) {
            return this.extensionService.activateByEvent((0, authenticationService_1.getAuthenticationProviderActivationEvent)(id), 1 /* Immediate */);
        }
        $sendDidChangeSessions(id, event) {
            this.authenticationService.sessionsUpdate(id, event);
        }
        $removeSession(providerId, sessionId) {
            return this.authenticationService.removeSession(providerId, sessionId);
        }
        async loginPrompt(providerName, extensionName) {
            const { choice } = await this.dialogService.show(severity_1.default.Info, nls.localize(10, null, extensionName, providerName), [nls.localize(11, null), nls.localize(12, null)], {
                cancelId: 1
            });
            return choice === 0;
        }
        async setTrustedExtensionAndAccountPreference(providerId, accountName, extensionId, extensionName, sessionId) {
            this.authenticationService.updatedAllowedExtension(providerId, accountName, extensionId, extensionName, true);
            this.storageService.store(`${extensionName}-${providerId}`, sessionId, 0 /* GLOBAL */, 1 /* MACHINE */);
        }
        async selectSession(providerId, extensionId, extensionName, scopes, potentialSessions, clearSessionPreference, silent) {
            if (!potentialSessions.length) {
                throw new Error('No potential sessions found');
            }
            if (clearSessionPreference) {
                this.storageService.remove(`${extensionName}-${providerId}`, 0 /* GLOBAL */);
            }
            else {
                const existingSessionPreference = this.storageService.get(`${extensionName}-${providerId}`, 0 /* GLOBAL */);
                if (existingSessionPreference) {
                    const matchingSession = potentialSessions.find(session => session.id === existingSessionPreference);
                    if (matchingSession) {
                        const allowed = this.authenticationService.isAccessAllowed(providerId, matchingSession.account.label, extensionId);
                        if (!allowed) {
                            if (!silent) {
                                const didAcceptPrompt = await this.authenticationService.showGetSessionPrompt(providerId, matchingSession.account.label, extensionId, extensionName);
                                if (!didAcceptPrompt) {
                                    throw new Error('User did not consent to login.');
                                }
                            }
                            else {
                                this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, potentialSessions);
                                return undefined;
                            }
                        }
                        return matchingSession;
                    }
                }
            }
            if (silent) {
                this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, potentialSessions);
                return undefined;
            }
            return this.authenticationService.selectSession(providerId, extensionId, extensionName, scopes, potentialSessions);
        }
        async $getSession(providerId, scopes, extensionId, extensionName, options) {
            const sessions = await this.authenticationService.getSessions(providerId, scopes, true);
            const silent = !options.createIfNone;
            let session;
            if (sessions.length) {
                if (!this.authenticationService.supportsMultipleAccounts(providerId)) {
                    session = sessions[0];
                    const allowed = this.authenticationService.isAccessAllowed(providerId, session.account.label, extensionId);
                    if (!allowed) {
                        if (!silent) {
                            const didAcceptPrompt = await this.authenticationService.showGetSessionPrompt(providerId, session.account.label, extensionId, extensionName);
                            if (!didAcceptPrompt) {
                                throw new Error('User did not consent to login.');
                            }
                        }
                        else if (allowed !== false) {
                            this.authenticationService.requestSessionAccess(providerId, extensionId, extensionName, scopes, [session]);
                            return undefined;
                        }
                        else {
                            return undefined;
                        }
                    }
                }
                else {
                    return this.selectSession(providerId, extensionId, extensionName, scopes, sessions, !!options.clearSessionPreference, silent);
                }
            }
            else {
                if (!silent) {
                    const providerName = await this.authenticationService.getLabel(providerId);
                    const isAllowed = await this.loginPrompt(providerName, extensionName);
                    if (!isAllowed) {
                        throw new Error('User did not consent to login.');
                    }
                    session = await this.authenticationService.createSession(providerId, scopes, true);
                    await this.setTrustedExtensionAndAccountPreference(providerId, session.account.label, extensionId, extensionName, session.id);
                }
                else {
                    await this.authenticationService.requestNewSession(providerId, scopes, extensionId, extensionName);
                }
            }
            if (session) {
                (0, authenticationService_1.addAccountUsage)(this.storageService, providerId, session.account.label, extensionId, extensionName);
            }
            return session;
        }
    };
    MainThreadAuthentication = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadAuthentication),
        __param(1, authenticationService_1.IAuthenticationService),
        __param(2, dialogs_1.IDialogService),
        __param(3, storage_1.IStorageService),
        __param(4, notification_1.INotificationService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, extensions_1.IExtensionService)
    ], MainThreadAuthentication);
    exports.MainThreadAuthentication = MainThreadAuthentication;
});
//# sourceMappingURL=mainThreadAuthentication.js.map