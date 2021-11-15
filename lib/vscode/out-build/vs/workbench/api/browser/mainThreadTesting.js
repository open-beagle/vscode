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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/workbench/api/common/extHostCustomers", "vs/workbench/contrib/testing/common/testCollection", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "../common/extHost.protocol"], function (require, exports, lifecycle_1, types_1, uri_1, range_1, extHostCustomers_1, testCollection_1, testResult_1, testResultService_1, testService_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTesting = void 0;
    const reviveDiff = (diff) => {
        var _a, _b;
        for (const entry of diff) {
            if (entry[0] === 0 /* Add */ || entry[0] === 1 /* Update */) {
                const item = entry[1];
                if ((_a = item.item) === null || _a === void 0 ? void 0 : _a.uri) {
                    item.item.uri = uri_1.URI.revive(item.item.uri);
                }
                if ((_b = item.item) === null || _b === void 0 ? void 0 : _b.range) {
                    item.item.range = range_1.Range.lift(item.item.range);
                }
            }
        }
    };
    let MainThreadTesting = class MainThreadTesting extends lifecycle_1.Disposable {
        constructor(extHostContext, testService, resultService) {
            super();
            this.testService = testService;
            this.resultService = resultService;
            this.testSubscriptions = new Map();
            this.testProviderRegistrations = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostTesting);
            this._register(this.testService.onShouldSubscribe(args => this.proxy.$subscribeToTests(args.resource, args.uri)));
            this._register(this.testService.onShouldUnsubscribe(args => this.proxy.$unsubscribeFromTests(args.resource, args.uri)));
            const prevResults = resultService.results.map(r => r.toJSON()).filter(types_1.isDefined);
            if (prevResults.length) {
                this.proxy.$publishTestResults(prevResults);
            }
            this._register(resultService.onResultsChanged(evt => {
                const results = 'completed' in evt ? evt.completed : ('inserted' in evt ? evt.inserted : undefined);
                const serialized = results === null || results === void 0 ? void 0 : results.toJSON();
                if (serialized) {
                    this.proxy.$publishTestResults([serialized]);
                }
            }));
            this._register(testService.registerRootProvider(this));
            for (const { resource, uri } of this.testService.subscriptions) {
                this.proxy.$subscribeToTests(resource, uri);
            }
        }
        /**
         * @inheritdoc
         */
        $addTestsToRun(runId, tests) {
            for (const test of tests) {
                test.uri = uri_1.URI.revive(test.uri);
                if (test.range) {
                    test.range = range_1.Range.lift(test.range);
                }
            }
            this.withLiveRun(runId, r => r.addTestChainToRun(tests));
        }
        /**
         * @inheritdoc
         */
        $startedExtensionTestRun(req) {
            this.resultService.createLiveResult(req);
        }
        /**
         * @inheritdoc
         */
        $startedTestRunTask(runId, task) {
            this.withLiveRun(runId, r => r.addTask(task));
        }
        /**
         * @inheritdoc
         */
        $finishedTestRunTask(runId, taskId) {
            this.withLiveRun(runId, r => r.markTaskComplete(taskId));
        }
        /**
         * @inheritdoc
         */
        $finishedExtensionTestRun(runId) {
            this.withLiveRun(runId, r => r.markComplete());
        }
        /**
         * @inheritdoc
         */
        $updateTestStateInRun(runId, taskId, testId, state, duration) {
            this.withLiveRun(runId, r => r.updateState(testId, taskId, state, duration));
        }
        /**
         * @inheritdoc
         */
        $appendOutputToRun(runId, _taskId, output) {
            this.withLiveRun(runId, r => r.output.append(output));
        }
        /**
         * @inheritdoc
         */
        $appendTestMessageInRun(runId, taskId, testId, message) {
            const r = this.resultService.getResult(runId);
            if (r && r instanceof testResult_1.LiveTestResult) {
                if (message.location) {
                    message.location.uri = uri_1.URI.revive(message.location.uri);
                    message.location.range = range_1.Range.lift(message.location.range);
                }
                r.appendMessage(testId, taskId, message);
            }
        }
        /**
         * @inheritdoc
         */
        $registerTestController(id) {
            const disposable = this.testService.registerTestController(id, {
                runTests: (req, token) => this.proxy.$runTestsForProvider(req, token),
                lookupTest: test => this.proxy.$lookupTest(test),
                expandTest: (src, levels) => this.proxy.$expandTest(src, isFinite(levels) ? levels : -1),
            });
            this.testProviderRegistrations.set(id, disposable);
        }
        /**
         * @inheritdoc
         */
        $unregisterTestController(id) {
            var _a;
            (_a = this.testProviderRegistrations.get(id)) === null || _a === void 0 ? void 0 : _a.dispose();
            this.testProviderRegistrations.delete(id);
        }
        /**
         * @inheritdoc
         */
        $subscribeToDiffs(resource, uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const disposable = this.testService.subscribeToDiffs(resource, uri, diff => this.proxy.$acceptDiff(resource, uriComponents, diff));
            this.testSubscriptions.set((0, testCollection_1.getTestSubscriptionKey)(resource, uri), disposable);
        }
        /**
         * @inheritdoc
         */
        $unsubscribeFromDiffs(resource, uriComponents) {
            var _a;
            const key = (0, testCollection_1.getTestSubscriptionKey)(resource, uri_1.URI.revive(uriComponents));
            (_a = this.testSubscriptions.get(key)) === null || _a === void 0 ? void 0 : _a.dispose();
            this.testSubscriptions.delete(key);
        }
        /**
         * @inheritdoc
         */
        $publishDiff(resource, uri, diff) {
            reviveDiff(diff);
            this.testService.publishDiff(resource, uri_1.URI.revive(uri), diff);
        }
        async $runTests(req, token) {
            const result = await this.testService.runTests(req, token);
            return result.id;
        }
        dispose() {
            super.dispose();
            for (const subscription of this.testSubscriptions.values()) {
                subscription.dispose();
            }
            this.testSubscriptions.clear();
        }
        withLiveRun(runId, fn) {
            const r = this.resultService.getResult(runId);
            return r && r instanceof testResult_1.LiveTestResult ? fn(r) : undefined;
        }
    };
    MainThreadTesting = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadTesting),
        __param(1, testService_1.ITestService),
        __param(2, testResultService_1.ITestResultService)
    ], MainThreadTesting);
    exports.MainThreadTesting = MainThreadTesting;
});
//# sourceMappingURL=mainThreadTesting.js.map