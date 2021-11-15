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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/workspaceTestCollectionService"], function (require, exports, async_1, cancellation_1, lifecycle_1, configuration_1, contextkey_1, instantiation_1, configuration_2, testingContextKeys_1, testResultService_1, testService_1, workspaceTestCollectionService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingAutoRun = exports.ITestingAutoRun = void 0;
    exports.ITestingAutoRun = (0, instantiation_1.createDecorator)('testingAutoRun');
    let TestingAutoRun = class TestingAutoRun extends lifecycle_1.Disposable {
        constructor(contextKeyService, testService, results, configuration, workspaceTests) {
            super();
            this.testService = testService;
            this.results = results;
            this.configuration = configuration;
            this.workspaceTests = workspaceTests;
            this.runner = this._register(new lifecycle_1.MutableDisposable());
            this.enabled = testingContextKeys_1.TestingContextKeys.autoRun.bindTo(contextKeyService);
            this._register(configuration.onDidChangeConfiguration(evt => {
                if (evt.affectsConfiguration("testing.autoRun.mode" /* AutoRunMode */) && this.enabled.get()) {
                    this.runner.value = this.makeRunner();
                }
            }));
        }
        /**
         * @inheritdoc
         */
        toggle() {
            const enabled = this.enabled.get();
            if (enabled) {
                this.runner.value = undefined;
            }
            else {
                this.runner.value = this.makeRunner();
            }
            this.enabled.set(!enabled);
        }
        /**
         * Creates the runner. Is triggered when tests are marked as retired.
         * Runs them on a debounce.
         */
        makeRunner() {
            let isRunning = false;
            const rerunIds = new Map();
            const store = new lifecycle_1.DisposableStore();
            const cts = new cancellation_1.CancellationTokenSource();
            store.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            let delay = (0, configuration_2.getTestingConfiguration)(this.configuration, "testing.autoRun.delay" /* AutoRunDelay */);
            store.add(this.configuration.onDidChangeConfiguration(() => {
                delay = (0, configuration_2.getTestingConfiguration)(this.configuration, "testing.autoRun.delay" /* AutoRunDelay */);
            }));
            const scheduler = store.add(new async_1.RunOnceScheduler(async () => {
                const tests = [...rerunIds.values()];
                isRunning = true;
                rerunIds.clear();
                await this.testService.runTests({ debug: false, tests, isAutoRun: true });
                isRunning = false;
                if (rerunIds.size > 0) {
                    scheduler.schedule(delay);
                }
            }, delay));
            const addToRerun = (test) => {
                var _a;
                rerunIds.set(`${test.testId}/${(_a = test.src) === null || _a === void 0 ? void 0 : _a.controller}`, test);
                if (!isRunning) {
                    scheduler.schedule(delay);
                }
            };
            store.add(this.results.onTestChanged(evt => {
                if (evt.reason === 0 /* Retired */) {
                    addToRerun({ testId: evt.item.item.extId });
                }
            }));
            if ((0, configuration_2.getTestingConfiguration)(this.configuration, "testing.autoRun.mode" /* AutoRunMode */) === "all" /* AllInWorkspace */) {
                const sub = this.workspaceTests.subscribeToWorkspaceTests();
                store.add(sub);
                sub.waitForAllRoots(cts.token).then(() => {
                    if (!cts.token.isCancellationRequested) {
                        for (const [, collection] of sub.workspaceFolderCollections) {
                            for (const rootId of collection.rootIds) {
                                const root = collection.getNodeById(rootId);
                                if (root) {
                                    addToRerun({ testId: root.item.extId, src: root.src });
                                }
                            }
                        }
                    }
                });
                store.add(sub.onDiff(([, diff]) => {
                    for (const entry of diff) {
                        if (entry[0] === 0 /* Add */) {
                            addToRerun({ testId: entry[1].item.extId, src: entry[1].src });
                        }
                    }
                }));
            }
            return store;
        }
    };
    TestingAutoRun = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, testService_1.ITestService),
        __param(2, testResultService_1.ITestResultService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, workspaceTestCollectionService_1.IWorkspaceTestCollectionService)
    ], TestingAutoRun);
    exports.TestingAutoRun = TestingAutoRun;
});
//# sourceMappingURL=testingAutoRun.js.map