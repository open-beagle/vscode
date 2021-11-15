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
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/platform/notification/common/notification", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/welcome/telemetryOptOut/browser/telemetryOptOut", "vs/workbench/contrib/experiments/common/experimentService", "vs/platform/configuration/common/configuration", "vs/base/common/platform", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/cancellation", "vs/platform/product/common/productService", "vs/workbench/services/host/browser/host", "vs/platform/environment/common/environment", "vs/workbench/services/configuration/common/jsonEditing"], function (require, exports, storage_1, telemetry_1, opener_1, notification_1, uri_1, nls_1, experimentService_1, configuration_1, platform_1, extensionManagement_1, cancellation_1, productService_1, host_1, environment_1, jsonEditing_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserTelemetryOptOut = exports.AbstractTelemetryOptOut = void 0;
    let AbstractTelemetryOptOut = class AbstractTelemetryOptOut {
        constructor(storageService, openerService, notificationService, hostService, telemetryService, experimentService, configurationService, galleryService, productService, environmentService, jsonEditingService) {
            this.storageService = storageService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.telemetryService = telemetryService;
            this.experimentService = experimentService;
            this.configurationService = configurationService;
            this.galleryService = galleryService;
            this.productService = productService;
            this.environmentService = environmentService;
            this.jsonEditingService = jsonEditingService;
        }
        async handleTelemetryOptOut() {
            if (this.productService.telemetryOptOutUrl && !this.storageService.get(AbstractTelemetryOptOut.TELEMETRY_OPT_OUT_SHOWN, 0 /* GLOBAL */)) {
                const experimentId = 'telemetryOptOut';
                const [count, experimentState] = await Promise.all([this.getWindowCount(), this.experimentService.getExperimentById(experimentId)]);
                if (!this.hostService.hasFocus && count > 1) {
                    return; // return early if meanwhile another window opened (we only show the opt-out once)
                }
                this.storageService.store(AbstractTelemetryOptOut.TELEMETRY_OPT_OUT_SHOWN, true, 0 /* GLOBAL */, 0 /* USER */);
                this.privacyUrl = this.productService.privacyStatementUrl || this.productService.telemetryOptOutUrl;
                if (experimentState && experimentState.state === 2 /* Run */ && this.telemetryService.isOptedIn) {
                    this.runExperiment(experimentId);
                    return;
                }
                const telemetryOptOutUrl = this.productService.telemetryOptOutUrl;
                if (telemetryOptOutUrl) {
                    this.showTelemetryOptOut(telemetryOptOutUrl);
                }
            }
        }
        showTelemetryOptOut(telemetryOptOutUrl) {
            const optOutNotice = (0, nls_1.localize)(0, null, this.privacyUrl, this.productService.telemetryOptOutUrl);
            const optInNotice = (0, nls_1.localize)(1, null, this.privacyUrl, this.productService.telemetryOptOutUrl);
            this.notificationService.prompt(notification_1.Severity.Info, this.telemetryService.isOptedIn ? optOutNotice : optInNotice, [{
                    label: (0, nls_1.localize)(2, null),
                    run: () => this.openerService.open(uri_1.URI.parse(telemetryOptOutUrl))
                }], { sticky: true });
        }
        runExperiment(experimentId) {
            const promptMessageKey = 'telemetryOptOut.optOutOption';
            const yesLabelKey = 'telemetryOptOut.OptIn';
            const noLabelKey = 'telemetryOptOut.OptOut';
            let promptMessage = (0, nls_1.localize)(3, null, this.privacyUrl);
            let yesLabel = (0, nls_1.localize)(4, null);
            let noLabel = (0, nls_1.localize)(5, null);
            let queryPromise = Promise.resolve(undefined);
            if (platform_1.locale && platform_1.locale !== platform_1.language && platform_1.locale !== 'en' && platform_1.locale.indexOf('en-') === -1) {
                queryPromise = this.galleryService.query({ text: `tag:lp-${platform_1.locale}` }, cancellation_1.CancellationToken.None).then(tagResult => {
                    if (!tagResult || !tagResult.total) {
                        return undefined;
                    }
                    const extensionToFetchTranslationsFrom = tagResult.firstPage.filter(e => e.publisher === 'MS-CEINTL' && e.name.indexOf('vscode-language-pack') === 0)[0] || tagResult.firstPage[0];
                    if (!extensionToFetchTranslationsFrom.assets || !extensionToFetchTranslationsFrom.assets.coreTranslations.length) {
                        return undefined;
                    }
                    return this.galleryService.getCoreTranslation(extensionToFetchTranslationsFrom, platform_1.locale)
                        .then(translation => {
                        const translationsFromPack = translation && translation.contents ? translation.contents['vs/workbench/contrib/welcome/telemetryOptOut/electron-browser/telemetryOptOut'] : {};
                        if (!!translationsFromPack[promptMessageKey] && !!translationsFromPack[yesLabelKey] && !!translationsFromPack[noLabelKey]) {
                            promptMessage = translationsFromPack[promptMessageKey].replace('{0}', this.privacyUrl) + ' (Please help Microsoft improve Visual Studio Code by allowing the collection of usage data.)';
                            yesLabel = translationsFromPack[yesLabelKey] + ' (Yes)';
                            noLabel = translationsFromPack[noLabelKey] + ' (No)';
                        }
                        return undefined;
                    });
                });
            }
            const logTelemetry = (optout) => {
                this.telemetryService.publicLog2('experiments:optout', typeof optout === 'boolean' ? { optout } : {});
            };
            queryPromise.then(() => {
                this.notificationService.prompt(notification_1.Severity.Info, promptMessage, [
                    {
                        label: yesLabel,
                        run: () => {
                            logTelemetry(false);
                        }
                    },
                    {
                        label: noLabel,
                        run: async () => {
                            logTelemetry(true);
                            this.configurationService.updateValue('telemetry.enableTelemetry', false);
                            await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['enable-crash-reporter'], value: false }], true);
                        }
                    }
                ], {
                    sticky: true,
                    onCancel: logTelemetry
                });
                this.experimentService.markAsCompleted(experimentId);
            });
        }
    };
    AbstractTelemetryOptOut.TELEMETRY_OPT_OUT_SHOWN = 'workbench.telemetryOptOutShown';
    AbstractTelemetryOptOut = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, opener_1.IOpenerService),
        __param(2, notification_1.INotificationService),
        __param(3, host_1.IHostService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, experimentService_1.IExperimentService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, productService_1.IProductService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, jsonEditing_1.IJSONEditingService)
    ], AbstractTelemetryOptOut);
    exports.AbstractTelemetryOptOut = AbstractTelemetryOptOut;
    let BrowserTelemetryOptOut = class BrowserTelemetryOptOut extends AbstractTelemetryOptOut {
        constructor(storageService, openerService, notificationService, hostService, telemetryService, experimentService, configurationService, galleryService, productService, environmentService, jsonEditingService) {
            super(storageService, openerService, notificationService, hostService, telemetryService, experimentService, configurationService, galleryService, productService, environmentService, jsonEditingService);
            this.handleTelemetryOptOut();
        }
        async getWindowCount() {
            return 1;
        }
    };
    BrowserTelemetryOptOut = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, opener_1.IOpenerService),
        __param(2, notification_1.INotificationService),
        __param(3, host_1.IHostService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, experimentService_1.IExperimentService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensionManagement_1.IExtensionGalleryService),
        __param(8, productService_1.IProductService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, jsonEditing_1.IJSONEditingService)
    ], BrowserTelemetryOptOut);
    exports.BrowserTelemetryOptOut = BrowserTelemetryOptOut;
});
//# sourceMappingURL=telemetryOptOut.js.map