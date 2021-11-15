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
define(["require", "exports", "vs/nls!vs/workbench/contrib/surveys/browser/ces.contribution", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/experiment/common/experimentService", "vs/base/common/uri", "vs/base/common/process", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, nls, instantiation_1, platform_1, contributions_1, platform_2, telemetry_1, storage_1, productService_1, notification_1, opener_1, experimentService_1, uri_1, process_1, async_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 60; // 1 hour
    const MIN_WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 5; // 5 minutes
    const MAX_INSTALL_AGE = 1000 * 60 * 60 * 24; // 24 hours
    const REMIND_LATER_DELAY = 1000 * 60 * 60 * 4; // 4 hours
    const SKIP_SURVEY_KEY = 'ces/skipSurvey';
    const REMIND_LATER_DATE_KEY = 'ces/remindLaterDate';
    let CESContribution = class CESContribution extends lifecycle_1.Disposable {
        constructor(storageService, notificationService, telemetryService, openerService, productService, tasExperimentService) {
            super();
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.openerService = openerService;
            this.productService = productService;
            this.promptDelayer = this._register(new async_1.ThrottledDelayer(0));
            this.tasExperimentService = tasExperimentService;
            if (!productService.cesSurveyUrl) {
                return;
            }
            const skipSurvey = storageService.get(SKIP_SURVEY_KEY, 0 /* GLOBAL */, '');
            if (skipSurvey) {
                return;
            }
            this.schedulePrompt();
        }
        async promptUser() {
            var _a, _b, _c, _d;
            const sendTelemetry = (userReaction) => {
                /* __GDPR__
                "cesSurvey:popup" : {
                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
                */
                this.telemetryService.publicLog('cesSurvey:popup', { userReaction });
            };
            const message = (_b = await ((_a = this.tasExperimentService) === null || _a === void 0 ? void 0 : _a.getTreatment('CESSurveyMessage'))) !== null && _b !== void 0 ? _b : nls.localize(0, null);
            const button = (_d = await ((_c = this.tasExperimentService) === null || _c === void 0 ? void 0 : _c.getTreatment('CESSurveyButton'))) !== null && _d !== void 0 ? _d : nls.localize(1, null);
            const notification = this.notificationService.prompt(notification_1.Severity.Info, message, [{
                    label: button,
                    run: () => {
                        sendTelemetry('accept');
                        this.telemetryService.getTelemetryInfo().then(info => {
                            this.openerService.open(uri_1.URI.parse(`${this.productService.cesSurveyUrl}?o=${encodeURIComponent(process_1.platform)}&v=${encodeURIComponent(this.productService.version)}&m=${encodeURIComponent(info.machineId)}}`));
                            this.skipSurvey();
                        });
                    }
                }, {
                    label: nls.localize(2, null),
                    run: () => {
                        sendTelemetry('remindLater');
                        this.storageService.store(REMIND_LATER_DATE_KEY, new Date().toUTCString(), 0 /* GLOBAL */, 0 /* USER */);
                        this.schedulePrompt();
                    }
                }], {
                sticky: true,
                onCancel: () => {
                    sendTelemetry('cancelled');
                    this.skipSurvey();
                }
            });
            await event_1.Event.toPromise(notification.onDidClose);
        }
        async schedulePrompt() {
            var _a;
            const isCandidate = await ((_a = this.tasExperimentService) === null || _a === void 0 ? void 0 : _a.getTreatment('CESSurvey'));
            if (!isCandidate) {
                this.skipSurvey();
                return;
            }
            let waitTimeToShowSurvey = 0;
            const remindLaterDate = this.storageService.get(REMIND_LATER_DATE_KEY, 0 /* GLOBAL */, '');
            if (remindLaterDate) {
                const timeToRemind = new Date(remindLaterDate).getTime() + REMIND_LATER_DELAY - Date.now();
                if (timeToRemind > 0) {
                    waitTimeToShowSurvey = timeToRemind;
                }
            }
            else {
                const info = await this.telemetryService.getTelemetryInfo();
                const timeFromInstall = Date.now() - new Date(info.firstSessionDate).getTime();
                const isNewInstall = !isNaN(timeFromInstall) && timeFromInstall < MAX_INSTALL_AGE;
                // Installation is older than MAX_INSTALL_AGE
                if (!isNewInstall) {
                    this.skipSurvey();
                    return;
                }
                if (timeFromInstall < WAIT_TIME_TO_SHOW_SURVEY) {
                    waitTimeToShowSurvey = WAIT_TIME_TO_SHOW_SURVEY - timeFromInstall;
                }
            }
            /* __GDPR__
            "cesSurvey:schedule" : { }
            */
            this.telemetryService.publicLog('cesSurvey:schedule');
            this.promptDelayer.trigger(async () => {
                await this.promptUser();
            }, Math.max(waitTimeToShowSurvey, MIN_WAIT_TIME_TO_SHOW_SURVEY));
        }
        skipSurvey() {
            this.storageService.store(SKIP_SURVEY_KEY, this.productService.version, 0 /* GLOBAL */, 0 /* USER */);
        }
    };
    CESContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, notification_1.INotificationService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, opener_1.IOpenerService),
        __param(4, productService_1.IProductService),
        __param(5, (0, instantiation_1.optional)(experimentService_1.ITASExperimentService))
    ], CESContribution);
    if (platform_1.language === 'en') {
        const workbenchRegistry = platform_2.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(CESContribution, 3 /* Restored */);
    }
});
//# sourceMappingURL=ces.contribution.js.map