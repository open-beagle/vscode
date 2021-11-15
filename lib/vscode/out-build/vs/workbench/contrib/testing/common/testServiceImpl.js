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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/testing/common/testServiceImpl", "vs/platform/contextkey/common/contextkey", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testCollection", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, arrays_1, async_1, cancellation_1, event_1, lifecycle_1, types_1, uri_1, nls_1, contextkey_1, notification_1, storage_1, workspaceTrust_1, observableValue_1, storedValue_1, testCollection_1, testingContextKeys_1, testResult_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTestCollection = exports.TestService = void 0;
    const workspaceUnsubscribeDelay = 30000;
    const documentUnsubscribeDelay = 5000;
    let TestService = class TestService extends lifecycle_1.Disposable {
        constructor(contextKeyService, storageService, notificationService, testResults, workspaceTrustRequestService) {
            super();
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.testResults = testResults;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.testControllers = new Map();
            this.testSubscriptions = new Map();
            this.subscribeEmitter = new event_1.Emitter();
            this.unsubscribeEmitter = new event_1.Emitter();
            this.busyStateChangeEmitter = new event_1.Emitter();
            this.changeProvidersEmitter = new event_1.Emitter();
            this.runningTests = new Map();
            this.rootProviders = new Set();
            this.excludeTests = observableValue_1.MutableObservableValue.stored(new storedValue_1.StoredValue({
                key: 'excludedTestItems',
                scope: 1 /* WORKSPACE */,
                target: 0 /* USER */,
                serialization: {
                    deserialize: v => new Set(JSON.parse(v)),
                    serialize: v => JSON.stringify([...v])
                },
            }, this.storageService), new Set());
            /**
             * Fired when extension hosts should pull events from their test factories.
             */
            this.onShouldSubscribe = this.subscribeEmitter.event;
            /**
             * Fired when extension hosts should stop pulling events from their test factories.
             */
            this.onShouldUnsubscribe = this.unsubscribeEmitter.event;
            /**
             * Fired when the number of providers change.
             */
            this.onDidChangeProviders = this.changeProvidersEmitter.event;
            /**
             * @inheritdoc
             */
            this.onBusyStateChange = this.busyStateChangeEmitter.event;
            this.providerCount = testingContextKeys_1.TestingContextKeys.providerCount.bindTo(contextKeyService);
            this.hasDebuggable = testingContextKeys_1.TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService);
            this.hasRunnable = testingContextKeys_1.TestingContextKeys.hasRunnableTests.bindTo(contextKeyService);
        }
        /**
         * @inheritdoc
         */
        async expandTest(test, levels) {
            var _a;
            await ((_a = this.testControllers.get(test.src.controller)) === null || _a === void 0 ? void 0 : _a.expandTest(test, levels));
        }
        /**
         * @inheritdoc
         */
        clearExcludedTests() {
            this.excludeTests.value = new Set();
        }
        /**
         * @inheritdoc
         */
        setTestExcluded(testId, exclude = !this.excludeTests.value.has(testId)) {
            const newSet = new Set(this.excludeTests.value);
            if (exclude) {
                newSet.add(testId);
            }
            else {
                newSet.delete(testId);
            }
            if (newSet.size !== this.excludeTests.value.size) {
                this.excludeTests.value = newSet;
            }
        }
        /**
         * Gets currently running tests.
         */
        get testRuns() {
            return this.runningTests.keys();
        }
        /**
         * Gets the current provider count.
         */
        get providers() {
            return this.providerCount.get() || 0;
        }
        /**
         * @inheritdoc
         */
        get subscriptions() {
            return [...this.testSubscriptions].map(([, s]) => s.ident);
        }
        /**
         * @inheritdoc
         */
        cancelTestRun(req) {
            var _a;
            (_a = this.runningTests.get(req)) === null || _a === void 0 ? void 0 : _a.cancel();
        }
        /**
         * @inheritdoc
         */
        async lookupTest(test) {
            var _a;
            for (const { collection } of this.testSubscriptions.values()) {
                const node = collection.getNodeById(test.testId);
                if (node) {
                    return node;
                }
            }
            return (_a = this.testControllers.get(test.src.controller)) === null || _a === void 0 ? void 0 : _a.lookupTest(test);
        }
        /**
         * @inheritdoc
         */
        registerRootProvider(provider) {
            if (this.rootProviders.has(provider)) {
                return (0, lifecycle_1.toDisposable)(() => { });
            }
            this.rootProviders.add(provider);
            for (const { collection } of this.testSubscriptions.values()) {
                collection.updatePendingRoots(1);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                if (this.rootProviders.delete(provider)) {
                    for (const { collection } of this.testSubscriptions.values()) {
                        collection.updatePendingRoots(-1);
                    }
                }
            });
        }
        /**
         * @inheritdoc
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            if (!req.exclude) {
                req.exclude = [...this.excludeTests.value];
            }
            const result = this.testResults.createLiveResult(req);
            const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                modal: true,
                message: (0, nls_1.localize)(0, null),
            });
            if (!trust) {
                result.markComplete();
                return result;
            }
            const testsWithIds = req.tests.map(test => {
                if (test.src) {
                    return test;
                }
                const subscribed = (0, arrays_1.mapFind)(this.testSubscriptions.values(), s => s.collection.getNodeById(test.testId));
                if (!subscribed) {
                    return undefined;
                }
                return { testId: test.testId, src: subscribed.src };
            }).filter(types_1.isDefined);
            try {
                const tests = (0, arrays_1.groupBy)(testsWithIds, (a, b) => a.src.controller === b.src.controller ? 0 : 1);
                const cancelSource = new cancellation_1.CancellationTokenSource(token);
                this.runningTests.set(req, cancelSource);
                const requests = tests.map(group => {
                    var _a, _b;
                    return (_a = this.testControllers.get(group[0].src.controller)) === null || _a === void 0 ? void 0 : _a.runTests({
                        runId: result.id,
                        debug: req.debug,
                        excludeExtIds: (_b = req.exclude) !== null && _b !== void 0 ? _b : [],
                        tests: group,
                    }, cancelSource.token).catch(err => {
                        this.notificationService.error((0, nls_1.localize)(1, null, err.message));
                    });
                });
                await Promise.all(requests);
                return result;
            }
            finally {
                this.runningTests.delete(req);
                result.markComplete();
            }
        }
        /**
         * @inheritdoc
         */
        resubscribeToAllTests() {
            for (const subscription of this.testSubscriptions.values()) {
                this.unsubscribeEmitter.fire(subscription.ident);
                const diff = subscription.collection.clear();
                subscription.onDiff.fire(diff);
                subscription.collection.pendingRootProviders = this.rootProviders.size;
                this.subscribeEmitter.fire(subscription.ident);
            }
        }
        /**
         * @inheritdoc
         */
        subscribeToDiffs(resource, uri, acceptDiff) {
            const subscriptionKey = (0, testCollection_1.getTestSubscriptionKey)(resource, uri);
            let subscription = this.testSubscriptions.get(subscriptionKey);
            if (!subscription) {
                subscription = {
                    ident: { resource, uri },
                    collection: new MainThreadTestCollection(this.rootProviders.size, this.expandTest.bind(this)),
                    listeners: 0,
                    onDiff: new event_1.Emitter(),
                };
                subscription.collection.onDidRetireTest(testId => {
                    for (const result of this.testResults.results) {
                        if (result instanceof testResult_1.LiveTestResult) {
                            result.retire(testId);
                        }
                    }
                });
                this.subscribeEmitter.fire({ resource, uri });
                this.testSubscriptions.set(subscriptionKey, subscription);
            }
            else if (subscription.disposeTimeout) {
                subscription.disposeTimeout.dispose();
                subscription.disposeTimeout = undefined;
            }
            subscription.listeners++;
            if (acceptDiff) {
                acceptDiff(subscription.collection.getReviverDiff());
            }
            const listener = acceptDiff && subscription.onDiff.event(acceptDiff);
            return {
                object: subscription.collection,
                dispose: () => {
                    listener === null || listener === void 0 ? void 0 : listener.dispose();
                    if (--subscription.listeners > 0) {
                        return;
                    }
                    subscription.disposeTimeout = (0, async_1.disposableTimeout)(() => {
                        this.unsubscribeEmitter.fire({ resource, uri });
                        this.testSubscriptions.delete(subscriptionKey);
                    }, resource === 1 /* TextDocument */ ? documentUnsubscribeDelay : workspaceUnsubscribeDelay);
                }
            };
        }
        /**
         * @inheritdoc
         */
        publishDiff(resource, uri, diff) {
            const sub = this.testSubscriptions.get((0, testCollection_1.getTestSubscriptionKey)(resource, uri_1.URI.revive(uri)));
            if (!sub) {
                return;
            }
            sub.collection.apply(diff);
            sub.onDiff.fire(diff);
            this.hasDebuggable.set(!!this.findTest(t => t.item.debuggable));
            this.hasRunnable.set(!!this.findTest(t => t.item.runnable));
        }
        /**
         * @inheritdoc
         */
        registerTestController(id, controller) {
            this.testControllers.set(id, controller);
            this.providerCount.set(this.testControllers.size);
            this.changeProvidersEmitter.fire({ delta: 1 });
            return (0, lifecycle_1.toDisposable)(() => {
                if (this.testControllers.delete(id)) {
                    this.providerCount.set(this.testControllers.size);
                    this.changeProvidersEmitter.fire({ delta: -1 });
                }
            });
        }
        findTest(predicate) {
            for (const { collection } of this.testSubscriptions.values()) {
                for (const test of collection.all) {
                    if (predicate(test)) {
                        return test;
                    }
                }
            }
            return undefined;
        }
    };
    TestService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, storage_1.IStorageService),
        __param(2, notification_1.INotificationService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], TestService);
    exports.TestService = TestService;
    class MainThreadTestCollection extends testCollection_1.AbstractIncrementalTestCollection {
        constructor(pendingRootProviders, expandActual) {
            super();
            this.expandActual = expandActual;
            this.pendingRootChangeEmitter = new event_1.Emitter();
            this.busyProvidersChangeEmitter = new event_1.Emitter();
            this.retireTestEmitter = new event_1.Emitter();
            this.expandPromises = new WeakMap();
            this.onPendingRootProvidersChange = this.pendingRootChangeEmitter.event;
            this.onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
            this.onDidRetireTest = this.retireTestEmitter.event;
            this.pendingRootCount = pendingRootProviders;
        }
        /**
         * @inheritdoc
         */
        get pendingRootProviders() {
            return this.pendingRootCount;
        }
        /**
         * Sets the number of pending root providers.
         */
        set pendingRootProviders(count) {
            this.pendingRootCount = count;
            this.pendingRootChangeEmitter.fire(count);
        }
        /**
         * @inheritdoc
         */
        get busyProviders() {
            return this.busyControllerCount;
        }
        /**
         * @inheritdoc
         */
        get rootIds() {
            return this.roots;
        }
        /**
         * @inheritdoc
         */
        get all() {
            return this.getIterator();
        }
        /**
         * @inheritdoc
         */
        expand(testId, levels) {
            const test = this.items.get(testId);
            if (!test) {
                return Promise.resolve();
            }
            // simple cache to avoid duplicate/unnecessary expansion calls
            const existing = this.expandPromises.get(test);
            if (existing && existing.pendingLvl >= levels) {
                return existing.prom;
            }
            const prom = this.expandActual({ src: test.src, testId: test.item.extId }, levels);
            const record = { doneLvl: existing ? existing.doneLvl : -1, pendingLvl: levels, prom };
            this.expandPromises.set(test, record);
            return prom.then(() => {
                record.doneLvl = levels;
            });
        }
        /**
         * @inheritdoc
         */
        getNodeById(id) {
            return this.items.get(id);
        }
        /**
         * @inheritdoc
         */
        getReviverDiff() {
            const ops = [[3 /* IncrementPendingExtHosts */, this.pendingRootCount]];
            const queue = [this.roots];
            while (queue.length) {
                for (const child of queue.pop()) {
                    const item = this.items.get(child);
                    ops.push([0 /* Add */, {
                            src: item.src,
                            expand: item.expand,
                            item: item.item,
                            parent: item.parent,
                        }]);
                    queue.push(item.children);
                }
            }
            return ops;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            let prevBusy = this.busyControllerCount;
            let prevPendingRoots = this.pendingRootCount;
            super.apply(diff);
            if (prevBusy !== this.busyControllerCount) {
                this.busyProvidersChangeEmitter.fire(this.busyControllerCount);
            }
            if (prevPendingRoots !== this.pendingRootCount) {
                this.pendingRootChangeEmitter.fire(this.pendingRootCount);
            }
        }
        /**
         * Clears everything from the collection, and returns a diff that applies
         * that action.
         */
        clear() {
            const ops = [];
            for (const root of this.roots) {
                ops.push([2 /* Remove */, root]);
            }
            this.roots.clear();
            this.items.clear();
            return ops;
        }
        /**
         * @override
         */
        createItem(internal) {
            return Object.assign(Object.assign({}, internal), { children: new Set() });
        }
        /**
         * @override
         */
        retireTest(testId) {
            this.retireTestEmitter.fire(testId);
        }
        *getIterator() {
            const queue = [this.rootIds];
            while (queue.length) {
                for (const id of queue.pop()) {
                    const node = this.getNodeById(id);
                    yield node;
                    queue.push(node.children);
                }
            }
        }
    }
    exports.MainThreadTestCollection = MainThreadTestCollection;
});
//# sourceMappingURL=testServiceImpl.js.map