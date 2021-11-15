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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/platform/instantiation/common/instantiation", "vs/platform/progress/common/progress", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, async_1, event_1, lifecycle_1, nls_1, instantiation_1, progress_1, extHostTypes_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingProgressUiService = exports.ITestingProgressUiService = void 0;
    exports.ITestingProgressUiService = (0, instantiation_1.createDecorator)('testingProgressUiService');
    let TestingProgressUiService = class TestingProgressUiService extends lifecycle_1.Disposable {
        constructor(resultService, instantiaionService) {
            super();
            this.resultService = resultService;
            this.instantiaionService = instantiaionService;
            this.current = this._register(new lifecycle_1.MutableDisposable());
            this.updateCountsEmitter = new event_1.Emitter();
            this.updateTextEmitter = new event_1.Emitter();
            this.onCountChange = this.updateCountsEmitter.event;
            this.onTextChange = this.updateTextEmitter.event;
            const scheduler = this._register(new async_1.RunOnceScheduler(() => this.updateProgress(), 200));
            this._register(resultService.onResultsChanged(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
            this._register(resultService.onTestChanged(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            }));
        }
        updateProgress() {
            const allResults = this.resultService.results;
            const running = allResults.filter(r => r.completedAt === undefined);
            if (!running.length) {
                if (allResults.length) {
                    const collected = collectTestStateCounts(false, allResults[0].counts);
                    this.updateCountsEmitter.fire(collected);
                    this.updateTextEmitter.fire(getTestProgressText(false, collected));
                }
                this.current.clear();
                return;
            }
            if (!this.current.value) {
                this.current.value = this.instantiaionService.createInstance(progress_1.UnmanagedProgress, { location: 10 /* Window */ });
            }
            const collected = collectTestStateCounts(true, ...running.map(r => r.counts));
            this.updateCountsEmitter.fire(collected);
            const message = getTestProgressText(true, collected);
            this.updateTextEmitter.fire(message);
            this.current.value.report({ message });
        }
    };
    TestingProgressUiService = __decorate([
        __param(0, testResultService_1.ITestResultService),
        __param(1, instantiation_1.IInstantiationService)
    ], TestingProgressUiService);
    exports.TestingProgressUiService = TestingProgressUiService;
    const collectTestStateCounts = (isRunning, ...counts) => {
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        let running = 0;
        let queued = 0;
        for (const count of counts) {
            failed += count[extHostTypes_1.TestResultState.Errored] + count[extHostTypes_1.TestResultState.Failed];
            passed += count[extHostTypes_1.TestResultState.Passed];
            skipped += count[extHostTypes_1.TestResultState.Skipped];
            running += count[extHostTypes_1.TestResultState.Running];
            queued += count[extHostTypes_1.TestResultState.Queued];
        }
        return {
            isRunning,
            passed,
            failed,
            runSoFar: passed + failed,
            totalWillBeRun: passed + failed + queued + running,
            skipped,
        };
    };
    const getTestProgressText = (running, { passed, runSoFar, skipped, failed }) => {
        let percent = passed / runSoFar * 100;
        if (failed > 0) {
            // fix: prevent from rounding to 100 if there's any failed test
            percent = Math.min(percent, 99.9);
        }
        else if (runSoFar === 0) {
            percent = 0;
        }
        if (running) {
            if (runSoFar === 0) {
                return (0, nls_1.localize)(0, null, passed, runSoFar, percent.toPrecision(3));
            }
            else if (skipped === 0) {
                return (0, nls_1.localize)(1, null, passed, runSoFar, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)(2, null, passed, runSoFar, percent.toPrecision(3), skipped);
            }
        }
        else {
            if (skipped === 0) {
                return (0, nls_1.localize)(3, null, passed, runSoFar, percent.toPrecision(3));
            }
            else {
                return (0, nls_1.localize)(4, null, passed, runSoFar, percent.toPrecision(3), skipped);
            }
        }
    };
});
//# sourceMappingURL=testingProgressUiService.js.map