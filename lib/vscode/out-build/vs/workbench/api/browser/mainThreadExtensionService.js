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
define(["require", "exports", "vs/base/common/severity", "vs/workbench/api/common/extHostCustomers", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/nls!vs/workbench/api/browser/mainThreadExtensionService", "vs/base/common/actions", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/host/browser/host", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/cancellation", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/environment/common/environmentService"], function (require, exports, severity_1, extHostCustomers_1, extHost_protocol_1, extensions_1, notification_1, nls_1, actions_1, extensionManagement_1, extensionManagementUtil_1, host_1, extensions_2, cancellation_1, timerService_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadExtensionService = void 0;
    let MainThreadExtensionService = class MainThreadExtensionService {
        constructor(extHostContext, _extensionService, _notificationService, _extensionsWorkbenchService, _hostService, _extensionEnablementService, _timerService, _environmentService) {
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._hostService = _hostService;
            this._extensionEnablementService = _extensionEnablementService;
            this._timerService = _timerService;
            this._environmentService = _environmentService;
            this._extensionHostKind = extHostContext.extensionHostKind;
        }
        dispose() {
        }
        $activateExtension(extensionId, reason) {
            return this._extensionService._activateById(extensionId, reason);
        }
        async $onWillActivateExtension(extensionId) {
            this._extensionService._onWillActivateExtension(extensionId);
        }
        $onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this._extensionService._onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason);
        }
        $onExtensionRuntimeError(extensionId, data) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this._extensionService._onExtensionRuntimeError(extensionId, error);
            console.error(`[${extensionId}]${error.message}`);
            console.error(error.stack);
        }
        async $onExtensionActivationError(extensionId, data, missingExtensionDependency) {
            const error = new Error();
            error.name = data.name;
            error.message = data.message;
            error.stack = data.stack;
            this._extensionService._onDidActivateExtensionError(extensionId, error);
            if (missingExtensionDependency) {
                const extension = await this._extensionService.getExtension(extensionId.value);
                if (extension) {
                    const local = await this._extensionsWorkbenchService.queryLocal();
                    const installedDependency = local.filter(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id: missingExtensionDependency.dependency }))[0];
                    if (installedDependency) {
                        await this._handleMissingInstalledDependency(extension, installedDependency.local);
                        return;
                    }
                    else {
                        await this._handleMissingNotInstalledDependency(extension, missingExtensionDependency.dependency);
                        return;
                    }
                }
            }
            const isDev = !this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment;
            if (isDev) {
                this._notificationService.error(error);
                return;
            }
            console.error(error.message);
        }
        async _handleMissingInstalledDependency(extension, missingInstalledDependency) {
            const extName = extension.displayName || extension.name;
            if (this._extensionEnablementService.isEnabled(missingInstalledDependency)) {
                this._notificationService.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)(0, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    actions: {
                        primary: [new actions_1.Action('reload', (0, nls_1.localize)(1, null), '', true, () => this._hostService.reload())]
                    }
                });
            }
            else {
                const enablementState = this._extensionEnablementService.getEnablementState(missingInstalledDependency);
                this._notificationService.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)(2, null, extName, missingInstalledDependency.manifest.displayName || missingInstalledDependency.manifest.name),
                    actions: {
                        primary: [new actions_1.Action('enable', (0, nls_1.localize)(3, null), '', true, () => this._extensionEnablementService.setEnablement([missingInstalledDependency], enablementState === 4 /* DisabledGlobally */ ? 6 /* EnabledGlobally */ : 7 /* EnabledWorkspace */)
                                .then(() => this._hostService.reload(), e => this._notificationService.error(e)))]
                    }
                });
            }
        }
        async _handleMissingNotInstalledDependency(extension, missingDependency) {
            const extName = extension.displayName || extension.name;
            let dependencyExtension = null;
            try {
                dependencyExtension = (await this._extensionsWorkbenchService.queryGallery({ names: [missingDependency] }, cancellation_1.CancellationToken.None)).firstPage[0];
            }
            catch (err) {
            }
            if (dependencyExtension) {
                this._notificationService.notify({
                    severity: severity_1.default.Error,
                    message: (0, nls_1.localize)(4, null, extName, dependencyExtension.displayName),
                    actions: {
                        primary: [new actions_1.Action('install', (0, nls_1.localize)(5, null), '', true, () => this._extensionsWorkbenchService.install(dependencyExtension)
                                .then(() => this._hostService.reload(), e => this._notificationService.error(e)))]
                    }
                });
            }
            else {
                this._notificationService.error((0, nls_1.localize)(6, null, extName, missingDependency));
            }
        }
        async $setPerformanceMarks(marks) {
            if (this._extensionHostKind === 0 /* LocalProcess */) {
                this._timerService.setPerformanceMarks('localExtHost', marks);
            }
            else if (this._extensionHostKind === 1 /* LocalWebWorker */) {
                this._timerService.setPerformanceMarks('workerExtHost', marks);
            }
            else {
                this._timerService.setPerformanceMarks('remoteExtHost', marks);
            }
        }
    };
    MainThreadExtensionService = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadExtensionService),
        __param(1, extensions_1.IExtensionService),
        __param(2, notification_1.INotificationService),
        __param(3, extensions_2.IExtensionsWorkbenchService),
        __param(4, host_1.IHostService),
        __param(5, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(6, timerService_1.ITimerService),
        __param(7, environmentService_1.IWorkbenchEnvironmentService)
    ], MainThreadExtensionService);
    exports.MainThreadExtensionService = MainThreadExtensionService;
});
//# sourceMappingURL=mainThreadExtensionService.js.map