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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/commands/common/commands", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/issue/common/issue", "vs/workbench/services/environment/common/environmentService"], function (require, exports, nls_1, extensionManagement_1, storage_1, extensions_1, notification_1, host_1, instantiation_1, actions_1, contextkey_1, dialogs_1, platform_1, contributions_1, commands_1, log_1, productService_1, issue_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionBisectService = void 0;
    // --- bisect service
    exports.IExtensionBisectService = (0, instantiation_1.createDecorator)('IExtensionBisectService');
    class BisectState {
        constructor(extensions, low, high, mid = ((low + high) / 2) | 0) {
            this.extensions = extensions;
            this.low = low;
            this.high = high;
            this.mid = mid;
        }
        static fromJSON(raw) {
            if (!raw) {
                return undefined;
            }
            try {
                const data = JSON.parse(raw);
                return new BisectState(data.extensions, data.low, data.high, data.mid);
            }
            catch (_a) {
                return undefined;
            }
        }
    }
    let ExtensionBisectService = class ExtensionBisectService {
        constructor(logService, _storageService, _envService) {
            this._storageService = _storageService;
            this._envService = _envService;
            this._disabled = new Map();
            const raw = _storageService.get(ExtensionBisectService._storageKey, 0 /* GLOBAL */);
            this._state = BisectState.fromJSON(raw);
            if (this._state) {
                const { mid, high } = this._state;
                for (let i = 0; i < this._state.extensions.length; i++) {
                    const isDisabled = i >= mid && i < high;
                    this._disabled.set(this._state.extensions[i], isDisabled);
                }
                logService.warn('extension BISECT active', [...this._disabled]);
            }
        }
        get isActive() {
            return !!this._state;
        }
        get disabledCount() {
            return this._state ? this._state.high - this._state.mid : -1;
        }
        isDisabledByBisect(extension) {
            if (!this._state) {
                // bisect isn't active
                return false;
            }
            if (this._isRemoteResolver(extension)) {
                // the current remote resolver extension cannot be disabled
                return false;
            }
            const disabled = this._disabled.get(extension.identifier.id);
            return disabled !== null && disabled !== void 0 ? disabled : false;
        }
        _isRemoteResolver(extension) {
            var _a, _b, _c;
            if (extension.manifest.enableProposedApi !== true) {
                return false;
            }
            const idx = (_a = this._envService.remoteAuthority) === null || _a === void 0 ? void 0 : _a.indexOf('+');
            const activationEvent = `onResolveRemoteAuthority:${(_b = this._envService.remoteAuthority) === null || _b === void 0 ? void 0 : _b.substr(0, idx)}`;
            return Boolean((_c = extension.manifest.activationEvents) === null || _c === void 0 ? void 0 : _c.find(e => e === activationEvent));
        }
        async start(extensions) {
            if (this._state) {
                throw new Error('invalid state');
            }
            const extensionIds = extensions.map(ext => ext.identifier.id);
            const newState = new BisectState(extensionIds, 0, extensionIds.length, 0);
            this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(newState), 0 /* GLOBAL */, 1 /* MACHINE */);
            await this._storageService.flush();
        }
        async next(seeingBad) {
            if (!this._state) {
                throw new Error('invalid state');
            }
            // check if bad when all extensions are disabled
            if (seeingBad && this._state.mid === 0 && this._state.high === this._state.extensions.length) {
                return { bad: true, id: '' };
            }
            // check if there is only one left
            if (this._state.low === this._state.high - 1) {
                await this.reset();
                return { id: this._state.extensions[this._state.low], bad: seeingBad };
            }
            // the second half is disabled so if there is still bad it must be
            // in the first half
            const nextState = new BisectState(this._state.extensions, seeingBad ? this._state.low : this._state.mid, seeingBad ? this._state.mid : this._state.high);
            this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(nextState), 0 /* GLOBAL */, 1 /* MACHINE */);
            await this._storageService.flush();
            return undefined;
        }
        async reset() {
            this._storageService.remove(ExtensionBisectService._storageKey, 0 /* GLOBAL */);
            await this._storageService.flush();
        }
    };
    ExtensionBisectService._storageKey = 'extensionBisectState';
    ExtensionBisectService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, storage_1.IStorageService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService)
    ], ExtensionBisectService);
    (0, extensions_1.registerSingleton)(exports.IExtensionBisectService, ExtensionBisectService, true);
    // --- bisect UI
    let ExtensionBisectUi = class ExtensionBisectUi {
        constructor(contextKeyService, _extensionBisectService, _notificationService, _commandService) {
            this._extensionBisectService = _extensionBisectService;
            this._notificationService = _notificationService;
            this._commandService = _commandService;
            if (_extensionBisectService.isActive) {
                ExtensionBisectUi.ctxIsBisectActive.bindTo(contextKeyService).set(true);
                this._showBisectPrompt();
            }
        }
        _showBisectPrompt() {
            const goodPrompt = {
                label: 'Good now',
                run: () => this._commandService.executeCommand('extension.bisect.next', false)
            };
            const badPrompt = {
                label: 'This is bad',
                run: () => this._commandService.executeCommand('extension.bisect.next', true)
            };
            const stop = {
                label: 'Stop Bisect',
                run: () => this._commandService.executeCommand('extension.bisect.stop')
            };
            this._notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null, this._extensionBisectService.disabledCount), [goodPrompt, badPrompt, stop], { sticky: true });
        }
    };
    ExtensionBisectUi.ctxIsBisectActive = new contextkey_1.RawContextKey('isExtensionBisectActive', false);
    ExtensionBisectUi = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, exports.IExtensionBisectService),
        __param(2, notification_1.INotificationService),
        __param(3, commands_1.ICommandService)
    ], ExtensionBisectUi);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionBisectUi, 3 /* Restored */);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.start',
                title: { value: (0, nls_1.localize)(1, null), original: 'Start Extension Bisect' },
                category: (0, nls_1.localize)(2, null),
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive.negate(),
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', 'workbench.view.extensions'),
                    group: '2_enablement',
                    order: 3
                }
            });
        }
        async run(accessor) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const hostService = accessor.get(host_1.IHostService);
            const extensionManagement = accessor.get(extensionManagement_1.IExtensionManagementService);
            const extensionEnablementService = accessor.get(extensionManagement_1.IGlobalExtensionEnablementService);
            const extensionsBisect = accessor.get(exports.IExtensionBisectService);
            const disabled = new Set(extensionEnablementService.getDisabledExtensions().map(id => id.id));
            const extensions = (await extensionManagement.getInstalled(1 /* User */)).filter(ext => !disabled.has(ext.identifier.id));
            const res = await dialogService.confirm({
                message: (0, nls_1.localize)(3, null),
                detail: (0, nls_1.localize)(4, null, 2 + Math.log2(extensions.length) | 0),
                primaryButton: (0, nls_1.localize)(5, null)
            });
            if (res.confirmed) {
                await extensionsBisect.start(extensions);
                hostService.reload();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.next',
                title: (0, nls_1.localize)(6, null),
                category: (0, nls_1.localize)(7, null),
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor, seeingBad) {
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const hostService = accessor.get(host_1.IHostService);
            const bisectService = accessor.get(exports.IExtensionBisectService);
            const productService = accessor.get(productService_1.IProductService);
            const extensionEnablementService = accessor.get(extensionManagement_1.IGlobalExtensionEnablementService);
            const issueService = accessor.get(issue_1.IWorkbenchIssueService);
            if (!bisectService.isActive) {
                return;
            }
            if (seeingBad === undefined) {
                const goodBadStopCancel = await this._checkForBad(dialogService, bisectService);
                if (goodBadStopCancel === null) {
                    return;
                }
                seeingBad = goodBadStopCancel;
            }
            if (seeingBad === undefined) {
                await bisectService.reset();
                hostService.reload();
                return;
            }
            const done = await bisectService.next(seeingBad);
            if (!done) {
                hostService.reload();
                return;
            }
            if (done.bad) {
                // DONE but nothing found
                await dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(8, null), [], {
                    detail: (0, nls_1.localize)(9, null, productService.nameShort)
                });
            }
            else {
                // DONE and identified extension
                const res = await dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(10, null), [(0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null)], 
                // [],
                {
                    detail: (0, nls_1.localize)(13, null, done.id),
                    checkbox: { label: (0, nls_1.localize)(14, null), checked: true },
                    cancelId: 1
                });
                if (res.checkboxChecked) {
                    await extensionEnablementService.disableExtension({ id: done.id }, undefined);
                }
                if (res.choice === 0) {
                    await issueService.openReporter({ extensionId: done.id });
                }
            }
            await bisectService.reset();
            hostService.reload();
        }
        async _checkForBad(dialogService, bisectService) {
            const options = {
                cancelId: 3,
                detail: (0, nls_1.localize)(15, null, bisectService.disabledCount),
            };
            const res = await dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(16, null), [(0, nls_1.localize)(17, null), (0, nls_1.localize)(18, null), (0, nls_1.localize)(19, null), (0, nls_1.localize)(20, null)], options);
            switch (res.choice) {
                case 0: return false; //good now
                case 1: return true; //bad
                case 2: return undefined; //stop
            }
            return null; //cancel
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'extension.bisect.stop',
                title: (0, nls_1.localize)(21, null),
                category: (0, nls_1.localize)(22, null),
                f1: true,
                precondition: ExtensionBisectUi.ctxIsBisectActive
            });
        }
        async run(accessor) {
            const extensionsBisect = accessor.get(exports.IExtensionBisectService);
            const hostService = accessor.get(host_1.IHostService);
            await extensionsBisect.reset();
            hostService.reload();
        }
    });
});
//# sourceMappingURL=extensionBisect.js.map