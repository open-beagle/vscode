/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/core/range", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/testingStates"], function (require, exports, buffer_1, event_1, lazy_1, lifecycle_1, uri_1, range_1, extHostTypes_1, getComputedState_1, testingStates_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HydratedTestResult = exports.LiveTestResult = exports.TestResultItemChangeReason = exports.LiveOutputController = exports.sumCounts = exports.makeEmptyCounts = exports.getPathForTestInResult = void 0;
    const getPathForTestInResult = (test, results) => {
        const path = [test];
        while (true) {
            const parentId = path[0].parent;
            const parent = parentId && results.getStateById(parentId);
            if (!parent) {
                break;
            }
            path.unshift(parent);
        }
        return path.map(t => t.item.extId);
    };
    exports.getPathForTestInResult = getPathForTestInResult;
    const makeEmptyCounts = () => {
        const o = {};
        for (const state of testingStates_1.statesInOrder) {
            o[state] = 0;
        }
        return o;
    };
    exports.makeEmptyCounts = makeEmptyCounts;
    const sumCounts = (counts) => {
        const total = (0, exports.makeEmptyCounts)();
        for (const count of counts) {
            for (const state of testingStates_1.statesInOrder) {
                total[state] += count[state];
            }
        }
        return total;
    };
    exports.sumCounts = sumCounts;
    /**
     * Deals with output of a {@link LiveTestResult}. By default we pass-through
     * data into the underlying write stream, but if a client requests to read it
     * we splice in the written data and then continue streaming incoming data.
     */
    class LiveOutputController {
        constructor(writer, reader) {
            this.writer = writer;
            this.reader = reader;
            /** Data written so far. This is available until the file closes. */
            this.previouslyWritten = [];
            this.dataEmitter = new event_1.Emitter();
            this.endEmitter = new event_1.Emitter();
        }
        /**
         * Appends data to the output.
         */
        append(data) {
            var _a;
            if (this.closed) {
                return this.closed;
            }
            (_a = this.previouslyWritten) === null || _a === void 0 ? void 0 : _a.push(data);
            this.dataEmitter.fire(data);
            return this.writer.getValue()[0].write(data);
        }
        /**
         * Reads the value of the stream.
         */
        read() {
            if (!this.previouslyWritten) {
                return this.reader();
            }
            const stream = (0, buffer_1.newWriteableBufferStream)();
            for (const chunk of this.previouslyWritten) {
                stream.write(chunk);
            }
            const disposable = new lifecycle_1.DisposableStore();
            disposable.add(this.dataEmitter.event(d => stream.write(d)));
            disposable.add(this.endEmitter.event(() => stream.end()));
            stream.on('end', () => disposable.dispose());
            return Promise.resolve(stream);
        }
        /**
         * Closes the output, signalling no more writes will be made.
         * @returns a promise that resolves when the output is written
         */
        close() {
            if (this.closed) {
                return this.closed;
            }
            if (!this.writer.hasValue()) {
                this.closed = Promise.resolve();
            }
            else {
                const [stream, ended] = this.writer.getValue();
                stream.end();
                this.closed = ended;
            }
            this.endEmitter.fire();
            this.closed.then(() => {
                this.previouslyWritten = undefined;
                this.dataEmitter.dispose();
                this.endEmitter.dispose();
            });
            return this.closed;
        }
    }
    exports.LiveOutputController = LiveOutputController;
    const itemToNode = (item, parent) => ({
        parent,
        item: Object.assign({}, item),
        children: [],
        tasks: [],
        ownComputedState: extHostTypes_1.TestResultState.Unset,
        computedState: extHostTypes_1.TestResultState.Unset,
        retired: false,
    });
    var TestResultItemChangeReason;
    (function (TestResultItemChangeReason) {
        TestResultItemChangeReason[TestResultItemChangeReason["Retired"] = 0] = "Retired";
        TestResultItemChangeReason[TestResultItemChangeReason["ParentRetired"] = 1] = "ParentRetired";
        TestResultItemChangeReason[TestResultItemChangeReason["ComputedStateChange"] = 2] = "ComputedStateChange";
        TestResultItemChangeReason[TestResultItemChangeReason["OwnStateChange"] = 3] = "OwnStateChange";
    })(TestResultItemChangeReason = exports.TestResultItemChangeReason || (exports.TestResultItemChangeReason = {}));
    /**
     * Results of a test. These are created when the test initially started running
     * and marked as "complete" when the run finishes.
     */
    class LiveTestResult {
        constructor(id, output, req) {
            this.id = id;
            this.output = output;
            this.req = req;
            this.completeEmitter = new event_1.Emitter();
            this.changeEmitter = new event_1.Emitter();
            this.testById = new Map();
            this.onChange = this.changeEmitter.event;
            this.onComplete = this.completeEmitter.event;
            this.tasks = [];
            /**
             * @inheritdoc
             */
            this.counts = (0, exports.makeEmptyCounts)();
            this.computedStateAccessor = {
                getOwnState: i => i.ownComputedState,
                getCurrentComputedState: i => i.computedState,
                setComputedState: (i, s) => i.computedState = s,
                getChildren: i => i.children,
                getParents: i => {
                    const { testById: testByExtId } = this;
                    return (function* () {
                        for (let parentId = i.parent; parentId;) {
                            const parent = testByExtId.get(parentId);
                            if (!parent) {
                                break;
                            }
                            yield parent;
                            parentId = parent.parent;
                        }
                    })();
                },
            };
            this.doSerialize = new lazy_1.Lazy(() => ({
                id: this.id,
                completedAt: this.completedAt,
                tasks: this.tasks,
                items: [...this.testById.values()].map(entry => (Object.assign(Object.assign({}, entry), { retired: undefined, src: undefined, children: [...entry.children.map(c => c.item.extId)] }))),
            }));
            this.isAutoRun = 'isAutoRun' in this.req && !!this.req.isAutoRun;
            this.includedIds = new Set(req.tests.map(t => typeof t === 'string' ? t : t.testId));
            this.excludedIds = new Set(req.exclude);
        }
        /**
         * @inheritdoc
         */
        get completedAt() {
            return this._completedAt;
        }
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * Adds a new run task to the results.
         */
        addTask(task) {
            const index = this.tasks.length;
            this.tasks.push(task);
            for (const test of this.tests) {
                test.tasks.push({ duration: undefined, messages: [], state: extHostTypes_1.TestResultState.Unset });
                this.fireUpdateAndRefresh(test, index, extHostTypes_1.TestResultState.Queued);
            }
        }
        /**
         * Add the chain of tests to the run. The first test in the chain should
         * be either a test root, or a previously-known test.
         */
        addTestChainToRun(chain) {
            let parent = this.testById.get(chain[0].extId);
            if (!parent) { // must be a test root
                parent = this.addTestToRun(chain[0], null);
            }
            for (let i = 1; i < chain.length; i++) {
                parent = this.addTestToRun(chain[i], parent.item.extId);
            }
            for (let i = 0; i < this.tasks.length; i++) {
                this.fireUpdateAndRefresh(parent, i, extHostTypes_1.TestResultState.Queued);
            }
            return undefined;
        }
        /**
         * Updates the state of the test by its internal ID.
         */
        updateState(testId, taskId, state, duration) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            const index = this.mustGetTaskIndex(taskId);
            if (duration !== undefined) {
                entry.tasks[index].duration = duration;
            }
            this.fireUpdateAndRefresh(entry, index, state);
        }
        /**
         * Appends a message for the test in the run.
         */
        appendMessage(testId, taskId, message) {
            const entry = this.testById.get(testId);
            if (!entry) {
                return;
            }
            entry.tasks[this.mustGetTaskIndex(taskId)].messages.push(message);
            this.changeEmitter.fire({
                item: entry,
                result: this,
                reason: 3 /* OwnStateChange */,
                previous: entry.ownComputedState,
            });
        }
        /**
         * @inheritdoc
         */
        getOutput() {
            return this.output.read();
        }
        /**
         * Marks a test as retired. This can trigger it to be rerun in live mode.
         */
        retire(testId) {
            const root = this.testById.get(testId);
            if (!root || root.retired) {
                return;
            }
            const queue = [[root]];
            while (queue.length) {
                for (const entry of queue.pop()) {
                    if (!entry.retired) {
                        entry.retired = true;
                        queue.push(entry.children);
                        this.changeEmitter.fire({
                            result: this,
                            item: entry,
                            reason: entry === root
                                ? 0 /* Retired */
                                : 1 /* ParentRetired */
                        });
                    }
                }
            }
        }
        /**
         * Marks the task in the test run complete.
         */
        markTaskComplete(taskId) {
            this.tasks[this.mustGetTaskIndex(taskId)].running = false;
            this.setAllToState(extHostTypes_1.TestResultState.Unset, taskId, t => t.state === extHostTypes_1.TestResultState.Queued || t.state === extHostTypes_1.TestResultState.Running);
        }
        /**
         * Notifies the service that all tests are complete.
         */
        markComplete() {
            if (this._completedAt !== undefined) {
                throw new Error('cannot complete a test result multiple times');
            }
            for (const task of this.tasks) {
                if (task.running) {
                    this.markTaskComplete(task.id);
                }
            }
            this._completedAt = Date.now();
            this.completeEmitter.fire();
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.completedAt && !('persist' in this.req && this.req.persist === false)
                ? this.doSerialize.getValue()
                : undefined;
        }
        /**
         * Updates all tests in the collection to the given state.
         */
        setAllToState(state, taskId, when) {
            const index = this.mustGetTaskIndex(taskId);
            for (const test of this.testById.values()) {
                if (when(test.tasks[index], test)) {
                    this.fireUpdateAndRefresh(test, index, state);
                }
            }
        }
        fireUpdateAndRefresh(entry, taskIndex, newState) {
            const previousOwnComputed = entry.ownComputedState;
            entry.tasks[taskIndex].state = newState;
            const newOwnComputed = (0, testingStates_1.maxPriority)(...entry.tasks.map(t => t.state));
            if (newOwnComputed === previousOwnComputed) {
                return;
            }
            entry.ownComputedState = newOwnComputed;
            this.counts[previousOwnComputed]--;
            this.counts[newOwnComputed]++;
            (0, getComputedState_1.refreshComputedState)(this.computedStateAccessor, entry, t => this.changeEmitter.fire(t === entry
                ? { item: entry, result: this, reason: 3 /* OwnStateChange */, previous: previousOwnComputed }
                : { item: t, result: this, reason: 2 /* ComputedStateChange */ }));
        }
        addTestToRun(item, parent) {
            var _a;
            const node = itemToNode(item, parent);
            node.direct = this.includedIds.has(item.extId);
            this.testById.set(item.extId, node);
            this.counts[extHostTypes_1.TestResultState.Unset]++;
            if (parent) {
                (_a = this.testById.get(parent)) === null || _a === void 0 ? void 0 : _a.children.push(node);
            }
            if (this.tasks.length) {
                for (let i = 0; i < this.tasks.length; i++) {
                    node.tasks.push({ duration: undefined, messages: [], state: extHostTypes_1.TestResultState.Queued });
                }
            }
            return node;
        }
        mustGetTaskIndex(taskId) {
            const index = this.tasks.findIndex(t => t.id === taskId);
            if (index === -1) {
                throw new Error(`Unknown task ${taskId} in updateState`);
            }
            return index;
        }
    }
    exports.LiveTestResult = LiveTestResult;
    /**
     * Test results hydrated from a previously-serialized test run.
     */
    class HydratedTestResult {
        constructor(serialized, outputLoader, persist = true) {
            this.serialized = serialized;
            this.outputLoader = outputLoader;
            this.persist = persist;
            /**
             * @inheritdoc
             */
            this.counts = (0, exports.makeEmptyCounts)();
            this.testById = new Map();
            this.id = serialized.id;
            this.completedAt = serialized.completedAt;
            this.tasks = serialized.tasks;
            for (const item of serialized.items) {
                const cast = Object.assign(Object.assign({}, item), { retired: true });
                cast.item.uri = uri_1.URI.revive(cast.item.uri);
                for (const task of cast.tasks) {
                    for (const message of task.messages) {
                        if (message.location) {
                            message.location.uri = uri_1.URI.revive(message.location.uri);
                            message.location.range = range_1.Range.lift(message.location.range);
                        }
                    }
                }
                this.counts[item.ownComputedState]++;
                this.testById.set(item.item.extId, cast);
            }
        }
        /**
         * @inheritdoc
         */
        get tests() {
            return this.testById.values();
        }
        /**
         * @inheritdoc
         */
        getStateById(extTestId) {
            return this.testById.get(extTestId);
        }
        /**
         * @inheritdoc
         */
        getOutput() {
            return this.outputLoader();
        }
        /**
         * @inheritdoc
         */
        toJSON() {
            return this.persist ? this.serialized : undefined;
        }
    }
    exports.HydratedTestResult = HydratedTestResult;
});
//# sourceMappingURL=testResult.js.map