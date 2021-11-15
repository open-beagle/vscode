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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/testing/common/ownedTestCollection", "vs/workbench/contrib/testing/common/testCollection"], function (require, exports, arrays_1, async_1, buffer_1, cancellation_1, event_1, functional_1, iterator_1, lifecycle_1, objects_1, types_1, uri_1, uuid_1, extHost_protocol_1, extHostDocumentsAndEditors_1, extHostRpcService_1, extHostTestingPrivateApi_1, Convert, extHostTypes_1, extHostWorkspace_1, ownedTestCollection_1, testCollection_1) {
    "use strict";
    var _TestRunTask_proxy, _TestRunTask_req, _TestRunTask_taskId, _TestRunTask_sharedIds;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MirroredTestCollection = exports.TestItemFilteredWrapper = exports.createDefaultDocumentTestRoot = exports.ExtHostTesting = void 0;
    const getTestSubscriptionKey = (resource, uri) => `${resource}:${uri.toString()}`;
    let ExtHostTesting = class ExtHostTesting {
        constructor(rpc, documents, workspace) {
            this.documents = documents;
            this.workspace = workspace;
            this.resultsChangedEmitter = new event_1.Emitter();
            this.controllers = new Map();
            this.ownedTests = new ownedTestCollection_1.OwnedTestCollection();
            this.testControllers = new Map();
            this.onResultsChanged = this.resultsChangedEmitter.event;
            this.results = [];
            this.proxy = rpc.getProxy(extHost_protocol_1.MainContext.MainThreadTesting);
            this.runQueue = new TestRunQueue(this.proxy);
            this.workspaceObservers = new WorkspaceFolderTestObserverFactory(this.proxy);
            this.textDocumentObservers = new TextDocumentTestObserverFactory(this.proxy, documents);
        }
        /**
         * Implements vscode.test.registerTestProvider
         */
        registerTestController(extensionId, controller) {
            const controllerId = (0, uuid_1.generateUuid)();
            this.controllers.set(controllerId, { instance: controller, extensionId });
            this.proxy.$registerTestController(controllerId);
            // give the ext a moment to register things rather than synchronously invoking within activate()
            const toSubscribe = [...this.testControllers.keys()];
            setTimeout(() => {
                var _a;
                for (const subscription of toSubscribe) {
                    (_a = this.testControllers.get(subscription)) === null || _a === void 0 ? void 0 : _a.subscribeFn(controllerId, controller);
                }
            }, 0);
            return new extHostTypes_1.Disposable(() => {
                this.controllers.delete(controllerId);
                this.proxy.$unregisterTestController(controllerId);
            });
        }
        /**
         * Implements vscode.test.createTextDocumentTestObserver
         */
        createTextDocumentTestObserver(document) {
            return this.textDocumentObservers.checkout(document.uri);
        }
        /**
         * Implements vscode.test.createWorkspaceTestObserver
         */
        createWorkspaceTestObserver(workspaceFolder) {
            return this.workspaceObservers.checkout(workspaceFolder.uri);
        }
        /**
         * Implements vscode.test.runTests
         */
        async runTests(req, token = cancellation_1.CancellationToken.None) {
            const testListToProviders = (tests) => tests
                .map(this.getInternalTestForReference, this)
                .filter(types_1.isDefined)
                .map(t => ({ src: t.src, testId: t.item.extId }));
            await this.proxy.$runTests({
                exclude: req.exclude ? testListToProviders(req.exclude).map(t => t.testId) : undefined,
                tests: testListToProviders(req.tests),
                debug: req.debug
            }, token);
        }
        /**
         * Implements vscode.test.createTestRun
         */
        createTestRun(extensionId, request, name, persist = true) {
            return this.runQueue.createTestRun(extensionId, request, name, persist);
        }
        /**
         * Updates test results shown to extensions.
         * @override
         */
        $publishTestResults(results) {
            this.results = Object.freeze(results
                .map(r => (0, objects_1.deepFreeze)(Convert.TestResults.to(r)))
                .concat(this.results)
                .sort((a, b) => b.completedAt - a.completedAt)
                .slice(0, 32));
            this.resultsChangedEmitter.fire();
        }
        /**
         * Handles a request to read tests for a file, or workspace.
         * @override
         */
        async $subscribeToTests(resource, uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const subscriptionKey = getTestSubscriptionKey(resource, uri);
            if (this.testControllers.has(subscriptionKey)) {
                return;
            }
            const cancellation = new cancellation_1.CancellationTokenSource();
            let method;
            if (resource === 1 /* TextDocument */) {
                let document = this.documents.getDocument(uri);
                // we can ask to subscribe to tests before the documents are populated in
                // the extension host. Try to wait.
                if (!document) {
                    const store = new lifecycle_1.DisposableStore();
                    document = await new Promise(resolve => {
                        store.add((0, async_1.disposableTimeout)(() => resolve(undefined), 5000));
                        store.add(this.documents.onDidAddDocuments(e => {
                            const data = e.find(data => data.document.uri.toString() === uri.toString());
                            if (data) {
                                resolve(data);
                            }
                        }));
                    }).finally(() => store.dispose());
                }
                if (document) {
                    const folder = await this.workspace.getWorkspaceFolder2(uri, false);
                    method = p => p.createDocumentTestRoot
                        ? p.createDocumentTestRoot(document.document, cancellation.token)
                        : (0, exports.createDefaultDocumentTestRoot)(p, document.document, folder, cancellation.token);
                }
            }
            else {
                const folder = await this.workspace.getWorkspaceFolder2(uri, false);
                if (folder) {
                    method = p => p.createWorkspaceTestRoot(folder, cancellation.token);
                }
            }
            if (!method) {
                return;
            }
            const subscribeFn = async (id, provider) => {
                try {
                    const root = await method(provider);
                    if (root) {
                        collection.addRoot(root, id);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            };
            const disposable = new lifecycle_1.DisposableStore();
            const collection = disposable.add(this.ownedTests.createForHierarchy(diff => this.proxy.$publishDiff(resource, uriComponents, diff)));
            disposable.add((0, lifecycle_1.toDisposable)(() => cancellation.dispose(true)));
            const subscribes = [];
            for (const [id, controller] of this.controllers) {
                subscribes.push(subscribeFn(id, controller.instance));
            }
            // note: we don't increment the count initially -- this is done by the
            // main thread, incrementing once per extension host. We just push the
            // diff to signal that roots have been discovered.
            Promise.all(subscribes).then(() => collection.pushDiff([3 /* IncrementPendingExtHosts */, -1]));
            this.testControllers.set(subscriptionKey, { store: disposable, collection, subscribeFn });
        }
        /**
         * Expands the nodes in the test tree. If levels is less than zero, it will
         * be treated as infinite.
         * @override
         */
        async $expandTest(test, levels) {
            const sub = (0, arrays_1.mapFind)(this.testControllers.values(), s => s.collection.treeId === test.src.tree ? s : undefined);
            await (sub === null || sub === void 0 ? void 0 : sub.collection.expand(test.testId, levels < 0 ? Infinity : levels));
            this.flushCollectionDiffs();
        }
        /**
         * Disposes of a previous subscription to tests.
         * @override
         */
        $unsubscribeFromTests(resource, uriComponents) {
            var _a;
            const uri = uri_1.URI.revive(uriComponents);
            const subscriptionKey = getTestSubscriptionKey(resource, uri);
            (_a = this.testControllers.get(subscriptionKey)) === null || _a === void 0 ? void 0 : _a.store.dispose();
            this.testControllers.delete(subscriptionKey);
        }
        /**
         * Receives a test update from the main thread. Called (eventually) whenever
         * tests change.
         * @override
         */
        $acceptDiff(resource, uri, diff) {
            if (resource === 1 /* TextDocument */) {
                this.textDocumentObservers.acceptDiff(uri_1.URI.revive(uri), diff);
            }
            else {
                this.workspaceObservers.acceptDiff(uri_1.URI.revive(uri), diff);
            }
        }
        /**
         * Runs tests with the given set of IDs. Allows for test from multiple
         * providers to be run.
         * @override
         */
        async $runTestsForProvider(req, token) {
            const controller = this.controllers.get(req.tests[0].src.controller);
            if (!controller) {
                return;
            }
            const includeTests = req.tests
                .map(({ testId, src }) => this.ownedTests.getTestById(testId, src === null || src === void 0 ? void 0 : src.tree))
                .filter(types_1.isDefined)
                .map(([_tree, test]) => test);
            const excludeTests = req.excludeExtIds
                .map(id => this.ownedTests.getTestById(id))
                .filter(types_1.isDefined)
                .filter(([tree, exclude]) => includeTests.some(include => tree.comparePositions(include, exclude) === 1 /* IsChild */));
            if (!includeTests.length) {
                return;
            }
            const publicReq = {
                tests: includeTests.map(t => TestItemFilteredWrapper.unwrap(t.actual)),
                exclude: excludeTests.map(([, t]) => TestItemFilteredWrapper.unwrap(t.actual)),
                debug: req.debug,
            };
            await this.runQueue.enqueueRun({
                dto: TestRunDto.fromInternal(req),
                token,
                extensionId: controller.extensionId,
                req: publicReq,
                doRun: () => controller.instance.runTests(publicReq, token)
            });
        }
        $lookupTest(req) {
            const owned = this.ownedTests.getTestById(req.testId);
            if (!owned) {
                return Promise.resolve(undefined);
            }
            const _a = owned[1], { actual, discoverCts, expandLevels } = _a, item = __rest(_a, ["actual", "discoverCts", "expandLevels"]);
            return Promise.resolve(item);
        }
        /**
         * Flushes diff information for all collections to ensure state in the
         * main thread is updated.
         */
        flushCollectionDiffs() {
            for (const { collection } of this.testControllers.values()) {
                collection.flushDiff();
            }
        }
        /**
         * Gets the internal test item associated with the reference from the extension.
         */
        getInternalTestForReference(test) {
            var _a, _b;
            // Find workspace items first, then owned tests, then document tests.
            // If a test instance exists in both the workspace and document, prefer
            // the workspace because it's less ephemeral.
            return (_b = (_a = this.workspaceObservers.getMirroredTestDataByReference(test)) !== null && _a !== void 0 ? _a : (0, arrays_1.mapFind)(this.testControllers.values(), c => c.collection.getTestByReference(test))) !== null && _b !== void 0 ? _b : this.textDocumentObservers.getMirroredTestDataByReference(test);
        }
    };
    ExtHostTesting = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService), __param(1, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors), __param(2, extHostWorkspace_1.IExtHostWorkspace)
    ], ExtHostTesting);
    exports.ExtHostTesting = ExtHostTesting;
    /**
     * Queues runs for a single extension and provides the currently-executing
     * run so that `createTestRun` can be properly correlated.
     */
    class TestRunQueue {
        constructor(proxy) {
            this.proxy = proxy;
            this.state = new Map();
        }
        /**
         * Registers and enqueues a test run. `doRun` will be called when an
         * invokation to {@link TestController.runTests} should be called.
         */
        enqueueRun(opts) {
            let record = this.state.get(opts.extensionId);
            if (!record) {
                record = { queue: [], current: undefined };
                this.state.set(opts.extensionId, record);
            }
            const deferred = new async_1.DeferredPromise();
            const runner = () => {
                const tasks = [];
                const shared = new Set();
                record.current = {
                    publicReq: opts.req,
                    factory: name => {
                        const task = new TestRunTask(name, opts.dto, shared, this.proxy);
                        tasks.push(task);
                        opts.token.onCancellationRequested(() => task.end());
                        return task;
                    },
                };
                this.invokeRunner(opts.extensionId, opts.dto.id, opts.doRun, tasks).finally(() => deferred.complete());
            };
            record.queue.push(runner);
            if (record.queue.length === 1) {
                runner();
            }
            return deferred.p;
        }
        /**
         * Implements the public `createTestRun` API.
         */
        createTestRun(extensionId, request, name, persist) {
            var _a, _b;
            const state = this.state.get(extensionId);
            // If the request is for the currently-executing `runTests`, then correlate
            // it to that existing run. Otherwise return a new, detached run.
            if ((state === null || state === void 0 ? void 0 : state.current.publicReq) === request) {
                return state.current.factory(name);
            }
            const dto = TestRunDto.fromPublic(request);
            const task = new TestRunTask(name, dto, new Set(), this.proxy);
            this.proxy.$startedExtensionTestRun({
                debug: request.debug,
                exclude: (_b = (_a = request.exclude) === null || _a === void 0 ? void 0 : _a.map(t => t.id)) !== null && _b !== void 0 ? _b : [],
                id: dto.id,
                tests: request.tests.map(t => t.id),
                persist: persist
            });
            task.onEnd.wait().then(() => this.proxy.$finishedExtensionTestRun(dto.id));
            return task;
        }
        invokeRunner(extensionId, runId, fn, tasks) {
            try {
                const res = fn();
                if ((0, async_1.isThenable)(res)) {
                    return res
                        .then(() => this.handleInvokeResult(extensionId, runId, tasks, undefined))
                        .catch(err => this.handleInvokeResult(extensionId, runId, tasks, err));
                }
                else {
                    return this.handleInvokeResult(extensionId, runId, tasks, undefined);
                }
            }
            catch (e) {
                return this.handleInvokeResult(extensionId, runId, tasks, e);
            }
        }
        async handleInvokeResult(extensionId, runId, tasks, error) {
            const record = this.state.get(extensionId);
            if (!record) {
                return;
            }
            record.queue.shift();
            if (record.queue.length > 0) {
                record.queue[0]();
            }
            else {
                this.state.delete(extensionId);
            }
            await Promise.all(tasks.map(t => t.onEnd.wait()));
        }
    }
    class TestRunDto {
        constructor(id, include, exclude) {
            this.id = id;
            this.include = include;
            this.exclude = exclude;
        }
        static fromPublic(request) {
            var _a, _b;
            return new TestRunDto((0, uuid_1.generateUuid)(), new Set(request.tests.map(t => t.id)), new Set((_b = (_a = request.exclude) === null || _a === void 0 ? void 0 : _a.map(t => t.id)) !== null && _b !== void 0 ? _b : iterator_1.Iterable.empty()));
        }
        static fromInternal(request) {
            return new TestRunDto(request.runId, new Set(request.tests.map(t => t.testId)), new Set(request.excludeExtIds));
        }
        isIncluded(test) {
            for (let t = test; t; t = t.parent) {
                if (this.include.has(t.id)) {
                    return true;
                }
                else if (this.exclude.has(t.id)) {
                    return false;
                }
            }
            return true;
        }
    }
    class TestRunTask {
        constructor(name, dto, sharedTestIds, proxy) {
            this.name = name;
            _TestRunTask_proxy.set(this, void 0);
            _TestRunTask_req.set(this, void 0);
            _TestRunTask_taskId.set(this, (0, uuid_1.generateUuid)());
            _TestRunTask_sharedIds.set(this, void 0);
            this.onEnd = new async_1.Barrier();
            __classPrivateFieldSet(this, _TestRunTask_proxy, proxy, "f");
            __classPrivateFieldSet(this, _TestRunTask_req, dto, "f");
            __classPrivateFieldSet(this, _TestRunTask_sharedIds, sharedTestIds, "f");
            proxy.$startedTestRunTask(dto.id, { id: __classPrivateFieldGet(this, _TestRunTask_taskId, "f"), name, running: true });
        }
        setState(test, state, duration) {
            if (__classPrivateFieldGet(this, _TestRunTask_req, "f").isIncluded(test)) {
                this.ensureTestIsKnown(test);
                __classPrivateFieldGet(this, _TestRunTask_proxy, "f").$updateTestStateInRun(__classPrivateFieldGet(this, _TestRunTask_req, "f").id, __classPrivateFieldGet(this, _TestRunTask_taskId, "f"), test.id, state, duration);
            }
        }
        appendMessage(test, message) {
            if (__classPrivateFieldGet(this, _TestRunTask_req, "f").isIncluded(test)) {
                this.ensureTestIsKnown(test);
                __classPrivateFieldGet(this, _TestRunTask_proxy, "f").$appendTestMessageInRun(__classPrivateFieldGet(this, _TestRunTask_req, "f").id, __classPrivateFieldGet(this, _TestRunTask_taskId, "f"), test.id, Convert.TestMessage.from(message));
            }
        }
        appendOutput(output) {
            __classPrivateFieldGet(this, _TestRunTask_proxy, "f").$appendOutputToRun(__classPrivateFieldGet(this, _TestRunTask_req, "f").id, __classPrivateFieldGet(this, _TestRunTask_taskId, "f"), buffer_1.VSBuffer.fromString(output));
        }
        end() {
            __classPrivateFieldGet(this, _TestRunTask_proxy, "f").$finishedTestRunTask(__classPrivateFieldGet(this, _TestRunTask_req, "f").id, __classPrivateFieldGet(this, _TestRunTask_taskId, "f"));
            this.onEnd.open();
        }
        ensureTestIsKnown(test) {
            const sent = __classPrivateFieldGet(this, _TestRunTask_sharedIds, "f");
            if (sent.has(test.id)) {
                return;
            }
            const chain = [];
            while (true) {
                chain.unshift(Convert.TestItem.from(test));
                if (sent.has(test.id)) {
                    break;
                }
                sent.add(test.id);
                if (!test.parent) {
                    break;
                }
                test = test.parent;
            }
            __classPrivateFieldGet(this, _TestRunTask_proxy, "f").$addTestsToRun(__classPrivateFieldGet(this, _TestRunTask_req, "f").id, chain);
        }
    }
    _TestRunTask_proxy = new WeakMap(), _TestRunTask_req = new WeakMap(), _TestRunTask_taskId = new WeakMap(), _TestRunTask_sharedIds = new WeakMap();
    const createDefaultDocumentTestRoot = async (provider, document, folder, token) => {
        if (!folder) {
            return;
        }
        const root = await provider.createWorkspaceTestRoot(folder, token);
        if (!root) {
            return;
        }
        token.onCancellationRequested(() => {
            TestItemFilteredWrapper.removeFilter(document);
        });
        const wrapper = TestItemFilteredWrapper.getWrapperForTestItem(root, document);
        wrapper.refreshMatch();
        return wrapper;
    };
    exports.createDefaultDocumentTestRoot = createDefaultDocumentTestRoot;
    /*
     * A class which wraps a vscode.TestItem that provides the ability to filter a TestItem's children
     * to only the children that are located in a certain vscode.Uri.
     */
    class TestItemFilteredWrapper extends extHostTypes_1.TestItemImpl {
        constructor(actual, filterDocument, actualParent) {
            super(actual.id, actual.label, actual.uri, undefined);
            this.actual = actual;
            this.filterDocument = filterDocument;
            this.actualParent = actualParent;
            if (!(actual instanceof extHostTypes_1.TestItemImpl)) {
                throw new Error(`TestItems provided to the VS Code API must extend \`vscode.TestItem\`, but ${actual.id} did not`);
            }
            this.debuggable = actual.debuggable;
            this.runnable = actual.runnable;
            this.description = actual.description;
            this.error = actual.error;
            this.status = actual.status;
            this.range = actual.range;
            this.resolveHandler = actual.resolveHandler;
            const wrapperApi = (0, extHostTestingPrivateApi_1.getPrivateApiFor)(this);
            const actualApi = (0, extHostTestingPrivateApi_1.getPrivateApiFor)(actual);
            actualApi.bus.event(evt => {
                switch (evt[0]) {
                    case 3 /* SetProp */:
                        this[evt[1]] = evt[2];
                        break;
                    case 0 /* NewChild */:
                        const wrapper = TestItemFilteredWrapper.getWrapperForTestItem(evt[1], this.filterDocument, this);
                        (0, extHostTestingPrivateApi_1.getPrivateApiFor)(wrapper).parent = actual;
                        wrapper.refreshMatch();
                        break;
                    default:
                        wrapperApi.bus.fire(evt);
                }
            });
        }
        static removeFilter(document) {
            this.wrapperMap.delete(document);
        }
        // Wraps the TestItem specified in a TestItemFilteredWrapper and pulls from a cache if it already exists.
        static getWrapperForTestItem(item, filterDocument, parent) {
            let innerMap = this.wrapperMap.get(filterDocument);
            if (innerMap === null || innerMap === void 0 ? void 0 : innerMap.has(item)) {
                return innerMap.get(item);
            }
            if (!innerMap) {
                innerMap = new WeakMap();
                this.wrapperMap.set(filterDocument, innerMap);
            }
            const w = new TestItemFilteredWrapper(item, filterDocument, parent);
            innerMap.set(item, w);
            return w;
        }
        /**
         * If the TestItem is wrapped, returns the unwrapped item provided
         * by the extension.
         */
        static unwrap(item) {
            return item instanceof TestItemFilteredWrapper ? item.actual : item;
        }
        /**
         * Gets whether this node, or any of its children, match the document filter.
         */
        get hasNodeMatchingFilter() {
            if (this._cachedMatchesFilter === undefined) {
                return this.refreshMatch();
            }
            else {
                return this._cachedMatchesFilter;
            }
        }
        /**
         * Refreshes the `hasNodeMatchingFilter` state for this item. It matches
         * if the test itself has a location that matches, or if any of its
         * children do.
         */
        refreshMatch() {
            var _a;
            const didMatch = this._cachedMatchesFilter;
            // The `children` of the wrapper only include the children who match the
            // filter. Synchronize them.
            for (const rawChild of this.actual.children.values()) {
                const wrapper = TestItemFilteredWrapper.getWrapperForTestItem(rawChild, this.filterDocument, this);
                if (!wrapper.hasNodeMatchingFilter) {
                    wrapper.dispose();
                }
                else if (!this.children.has(wrapper.id)) {
                    this.addChild(wrapper);
                }
            }
            const nowMatches = this.children.size > 0 || this.actual.uri.toString() === this.filterDocument.uri.toString();
            this._cachedMatchesFilter = nowMatches;
            if (nowMatches !== didMatch) {
                (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.refreshMatch();
            }
            return this._cachedMatchesFilter;
        }
        dispose() {
            if (this.actualParent) {
                (0, extHostTestingPrivateApi_1.getPrivateApiFor)(this.actualParent).children.delete(this.id);
            }
            (0, extHostTestingPrivateApi_1.getPrivateApiFor)(this).bus.fire([1 /* Disposed */]);
        }
    }
    exports.TestItemFilteredWrapper = TestItemFilteredWrapper;
    TestItemFilteredWrapper.wrapperMap = new WeakMap();
    class MirroredChangeCollector extends testCollection_1.IncrementalChangeCollector {
        constructor(emitter) {
            super();
            this.emitter = emitter;
            this.added = new Set();
            this.updated = new Set();
            this.removed = new Set();
            this.alreadyRemoved = new Set();
        }
        get isEmpty() {
            return this.added.size === 0 && this.removed.size === 0 && this.updated.size === 0;
        }
        /**
         * @override
         */
        add(node) {
            this.added.add(node);
        }
        /**
         * @override
         */
        update(node) {
            Object.assign(node.revived, Convert.TestItem.toPlain(node.item));
            if (!this.added.has(node)) {
                this.updated.add(node);
            }
        }
        /**
         * @override
         */
        remove(node) {
            if (this.added.has(node)) {
                this.added.delete(node);
                return;
            }
            this.updated.delete(node);
            if (node.parent && this.alreadyRemoved.has(node.parent)) {
                this.alreadyRemoved.add(node.item.extId);
                return;
            }
            this.removed.add(node);
        }
        /**
         * @override
         */
        getChangeEvent() {
            const { added, updated, removed } = this;
            return {
                get added() { return [...added].map(n => n.revived); },
                get updated() { return [...updated].map(n => n.revived); },
                get removed() { return [...removed].map(n => n.revived); },
            };
        }
        complete() {
            if (!this.isEmpty) {
                this.emitter.fire(this.getChangeEvent());
            }
        }
    }
    /**
     * Maintains tests in this extension host sent from the main thread.
     * @private
     */
    class MirroredTestCollection extends testCollection_1.AbstractIncrementalTestCollection {
        constructor() {
            super(...arguments);
            this.changeEmitter = new event_1.Emitter();
            /**
             * Change emitter that fires with the same sematics as `TestObserver.onDidChangeTests`.
             */
            this.onDidChangeTests = this.changeEmitter.event;
        }
        /**
         * Gets a list of root test items.
         */
        get rootTestItems() {
            return this.getAllAsTestItem([...this.roots]);
        }
        /**
         * Translates the item IDs to TestItems for exposure to extensions.
         */
        getAllAsTestItem(itemIds) {
            let output = [];
            for (const itemId of itemIds) {
                const item = this.items.get(itemId);
                if (item) {
                    output.push(item.revived);
                }
            }
            return output;
        }
        /**
         *
         * If the test ID exists, returns its underlying ID.
         */
        getMirroredTestDataById(itemId) {
            return this.items.get(itemId);
        }
        /**
         * If the test item is a mirrored test item, returns its underlying ID.
         */
        getMirroredTestDataByReference(item) {
            return this.items.get(item.id);
        }
        /**
         * @override
         */
        createItem(item, parent) {
            return Object.assign(Object.assign({}, item), { 
                // todo@connor4312: make this work well again with children
                revived: Convert.TestItem.toPlain(item.item), depth: parent ? parent.depth + 1 : 0, children: new Set() });
        }
        /**
         * @override
         */
        createChangeCollector() {
            return new MirroredChangeCollector(this.changeEmitter);
        }
    }
    exports.MirroredTestCollection = MirroredTestCollection;
    class AbstractTestObserverFactory {
        constructor() {
            this.resources = new Map();
        }
        checkout(resourceUri) {
            var _a, _b;
            const resourceKey = resourceUri.toString();
            const resource = (_a = this.resources.get(resourceKey)) !== null && _a !== void 0 ? _a : this.createObserverData(resourceUri);
            (_b = resource.pendingDeletion) === null || _b === void 0 ? void 0 : _b.dispose();
            resource.observers++;
            return {
                onDidChangeTest: resource.tests.onDidChangeTests,
                onDidDiscoverInitialTests: new event_1.Emitter().event,
                get tests() {
                    return resource.tests.rootTestItems;
                },
                dispose: (0, functional_1.once)(() => {
                    if (!--resource.observers) {
                        resource.pendingDeletion = this.eventuallyDispose(resourceUri);
                    }
                }),
            };
        }
        /**
         * Gets the internal test data by its reference, in any observer.
         */
        getMirroredTestDataByReference(ref) {
            for (const { tests } of this.resources.values()) {
                const v = tests.getMirroredTestDataByReference(ref);
                if (v) {
                    return v;
                }
            }
            return undefined;
        }
        /**
         * Called when no observers are listening for the resource any more. Should
         * defer unlistening on the resource, and return a disposiable
         * to halt the process in case new listeners come in.
         */
        eventuallyDispose(resourceUri) {
            return (0, async_1.disposableTimeout)(() => this.unlisten(resourceUri), 10 * 1000);
        }
        createObserverData(resourceUri) {
            const tests = new MirroredTestCollection();
            const listener = this.listen(resourceUri, diff => tests.apply(diff));
            const data = { observers: 0, tests, listener };
            this.resources.set(resourceUri.toString(), data);
            return data;
        }
        /**
         * Called when a resource is no longer in use.
         */
        unlisten(resourceUri) {
            var _a;
            const key = resourceUri.toString();
            const resource = this.resources.get(key);
            if (resource) {
                resource.observers = -1;
                (_a = resource.pendingDeletion) === null || _a === void 0 ? void 0 : _a.dispose();
                resource.listener.dispose();
                this.resources.delete(key);
            }
        }
    }
    class WorkspaceFolderTestObserverFactory extends AbstractTestObserverFactory {
        constructor(proxy) {
            super();
            this.proxy = proxy;
            this.diffListeners = new Map();
        }
        /**
         * Publishees the diff for the workspace folder with the given uri.
         */
        acceptDiff(resourceUri, diff) {
            var _a;
            (_a = this.diffListeners.get(resourceUri.toString())) === null || _a === void 0 ? void 0 : _a(diff);
        }
        /**
         * @override
         */
        listen(resourceUri, onDiff) {
            this.proxy.$subscribeToDiffs(0 /* Workspace */, resourceUri);
            const uriString = resourceUri.toString();
            this.diffListeners.set(uriString, onDiff);
            return new extHostTypes_1.Disposable(() => {
                this.proxy.$unsubscribeFromDiffs(0 /* Workspace */, resourceUri);
                this.diffListeners.delete(uriString);
            });
        }
    }
    class TextDocumentTestObserverFactory extends AbstractTestObserverFactory {
        constructor(proxy, documents) {
            super();
            this.proxy = proxy;
            this.documents = documents;
            this.diffListeners = new Map();
        }
        /**
         * Publishees the diff for the document with the given uri.
         */
        acceptDiff(resourceUri, diff) {
            var _a;
            (_a = this.diffListeners.get(resourceUri.toString())) === null || _a === void 0 ? void 0 : _a(diff);
        }
        /**
         * @override
         */
        listen(resourceUri, onDiff) {
            const document = this.documents.getDocument(resourceUri);
            if (!document) {
                return new extHostTypes_1.Disposable(() => undefined);
            }
            const uriString = resourceUri.toString();
            this.diffListeners.set(uriString, onDiff);
            this.proxy.$subscribeToDiffs(1 /* TextDocument */, resourceUri);
            return new extHostTypes_1.Disposable(() => {
                this.proxy.$unsubscribeFromDiffs(1 /* TextDocument */, resourceUri);
                this.diffListeners.delete(uriString);
            });
        }
    }
});
//# sourceMappingURL=extHostTesting.js.map