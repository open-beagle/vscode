/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/lazy", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testStubs", "vs/workbench/contrib/testing/test/common/ownedTestCollection", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, async_1, buffer_1, lazy_1, mockKeybindingService_1, log_1, testResult_1, testResultService_1, testResultStorage_1, testStubs_1, ownedTestCollection_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.emptyOutputController = void 0;
    const emptyOutputController = () => new testResult_1.LiveOutputController(new lazy_1.Lazy(() => [(0, buffer_1.newWriteableBufferStream)(), Promise.resolve()]), () => Promise.resolve((0, buffer_1.bufferToStream)(buffer_1.VSBuffer.alloc(0))));
    exports.emptyOutputController = emptyOutputController;
    suite('Workbench - Test Results Service', () => {
        const getLabelsIn = (it) => [...it].map(t => t.item.label).sort();
        const getChangeSummary = () => [...changed]
            .map(c => ({ reason: c.reason, label: c.item.item.label }))
            .sort((a, b) => a.label.localeCompare(b.label));
        let r;
        let changed = new Set();
        let tests;
        const defaultOpts = {
            exclude: [],
            debug: false,
            id: 'x',
            persist: true,
        };
        class TestLiveTestResult extends testResult_1.LiveTestResult {
            setAllToState(state, taskId, when) {
                super.setAllToState(state, taskId, when);
            }
        }
        setup(async () => {
            changed = new Set();
            r = new TestLiveTestResult('foo', (0, exports.emptyOutputController)(), Object.assign(Object.assign({}, defaultOpts), { tests: ['id-a'] }));
            r.onChange(e => changed.add(e));
            r.addTask({ id: 't', name: undefined, running: true });
            tests = testStubs_1.testStubs.nested();
            r.addTestChainToRun((0, testStubs_1.testStubsChain)(tests, ['id-a', 'id-aa']).map(testStubs_1.Convert.TestItem.from));
            r.addTestChainToRun((0, testStubs_1.testStubsChain)(tests, ['id-a', 'id-ab'], 1).map(testStubs_1.Convert.TestItem.from));
        });
        suite('LiveTestResult', () => {
            test('is empty if no tests are yet present', async () => {
                assert.deepStrictEqual(getLabelsIn(new TestLiveTestResult('foo', (0, exports.emptyOutputController)(), Object.assign(Object.assign({}, defaultOpts), { tests: ['id-a'] })).tests), []);
            });
            test('initially queues with update', () => {
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'a', reason: 2 /* ComputedStateChange */ },
                    { label: 'aa', reason: 3 /* OwnStateChange */ },
                    { label: 'ab', reason: 3 /* OwnStateChange */ },
                    { label: 'root', reason: 2 /* ComputedStateChange */ },
                ]);
            });
            test('initializes with the subtree of requested tests', () => {
                assert.deepStrictEqual(getLabelsIn(r.tests), ['a', 'aa', 'ab', 'root']);
            });
            test('initializes with valid counts', () => {
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Queued]: 2, [testStubs_1.ReExportedTestRunState.Unset]: 2 }));
            });
            test('setAllToState', () => {
                var _a, _b;
                changed.clear();
                r.setAllToState(testStubs_1.ReExportedTestRunState.Queued, 't', (_, t) => t.item.label !== 'root');
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Unset]: 1, [testStubs_1.ReExportedTestRunState.Queued]: 3 }));
                r.setAllToState(testStubs_1.ReExportedTestRunState.Passed, 't', (_, t) => t.item.label !== 'root');
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Unset]: 1, [testStubs_1.ReExportedTestRunState.Passed]: 3 }));
                assert.deepStrictEqual((_a = r.getStateById('id-a')) === null || _a === void 0 ? void 0 : _a.ownComputedState, testStubs_1.ReExportedTestRunState.Passed);
                assert.deepStrictEqual((_b = r.getStateById('id-a')) === null || _b === void 0 ? void 0 : _b.tasks[0].state, testStubs_1.ReExportedTestRunState.Passed);
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'a', reason: 3 /* OwnStateChange */ },
                    { label: 'aa', reason: 3 /* OwnStateChange */ },
                    { label: 'ab', reason: 3 /* OwnStateChange */ },
                    { label: 'root', reason: 2 /* ComputedStateChange */ },
                ]);
            });
            test('updateState', () => {
                var _a, _b;
                changed.clear();
                r.updateState('id-aa', 't', testStubs_1.ReExportedTestRunState.Running);
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Unset]: 2, [testStubs_1.ReExportedTestRunState.Running]: 1, [testStubs_1.ReExportedTestRunState.Queued]: 1 }));
                assert.deepStrictEqual((_a = r.getStateById('id-aa')) === null || _a === void 0 ? void 0 : _a.ownComputedState, testStubs_1.ReExportedTestRunState.Running);
                // update computed state:
                assert.deepStrictEqual((_b = r.getStateById('id-root')) === null || _b === void 0 ? void 0 : _b.computedState, testStubs_1.ReExportedTestRunState.Running);
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'a', reason: 2 /* ComputedStateChange */ },
                    { label: 'aa', reason: 3 /* OwnStateChange */ },
                    { label: 'root', reason: 2 /* ComputedStateChange */ },
                ]);
            });
            test('retire', () => {
                changed.clear();
                r.retire('id-a');
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'a', reason: 0 /* Retired */ },
                    { label: 'aa', reason: 1 /* ParentRetired */ },
                    { label: 'ab', reason: 1 /* ParentRetired */ },
                ]);
                changed.clear();
                r.retire('id-a');
                assert.strictEqual(changed.size, 0);
            });
            test('ignores outside run', () => {
                changed.clear();
                r.updateState('id-b', 't', testStubs_1.ReExportedTestRunState.Running);
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Queued]: 2, [testStubs_1.ReExportedTestRunState.Unset]: 2 }));
                assert.deepStrictEqual(r.getStateById('id-b'), undefined);
            });
            test('markComplete', () => {
                var _a, _b;
                r.setAllToState(testStubs_1.ReExportedTestRunState.Queued, 't', () => true);
                r.updateState('id-aa', 't', testStubs_1.ReExportedTestRunState.Passed);
                changed.clear();
                r.markComplete();
                assert.deepStrictEqual(r.counts, Object.assign(Object.assign({}, (0, testResult_1.makeEmptyCounts)()), { [testStubs_1.ReExportedTestRunState.Passed]: 1, [testStubs_1.ReExportedTestRunState.Unset]: 3 }));
                assert.deepStrictEqual((_a = r.getStateById('id-root')) === null || _a === void 0 ? void 0 : _a.ownComputedState, testStubs_1.ReExportedTestRunState.Unset);
                assert.deepStrictEqual((_b = r.getStateById('id-aa')) === null || _b === void 0 ? void 0 : _b.ownComputedState, testStubs_1.ReExportedTestRunState.Passed);
            });
        });
        suite('service', () => {
            let storage;
            let results;
            class TestTestResultService extends testResultService_1.TestResultService {
                constructor() {
                    super(...arguments);
                    this.persistScheduler = { schedule: () => this.persistImmediately() };
                }
            }
            setup(() => {
                storage = new testResultStorage_1.InMemoryResultStorage(new workbenchTestServices_1.TestStorageService(), new log_1.NullLogService());
                results = new TestTestResultService(new mockKeybindingService_1.MockContextKeyService(), storage);
            });
            test('pushes new result', () => {
                results.push(r);
                assert.deepStrictEqual(results.results, [r]);
            });
            test('serializes and re-hydrates', async () => {
                results.push(r);
                r.updateState('id-aa', 't', testStubs_1.ReExportedTestRunState.Passed);
                r.markComplete();
                await (0, async_1.timeout)(0); // allow persistImmediately async to happen
                results = new testResultService_1.TestResultService(new mockKeybindingService_1.MockContextKeyService(), storage);
                assert.strictEqual(0, results.results.length);
                await (0, async_1.timeout)(0); // allow load promise to resolve
                assert.strictEqual(1, results.results.length);
                const [rehydrated, actual] = results.getStateById('id-root');
                const expected = Object.assign({}, r.getStateById('id-root'));
                delete expected.tasks[0].duration; // delete undefined props that don't survive serialization
                delete expected.item.range;
                delete expected.item.description;
                expected.item.uri = actual.item.uri;
                assert.deepStrictEqual(actual, Object.assign(Object.assign({}, expected), { src: undefined, retired: true, children: ['id-a'] }));
                assert.deepStrictEqual(rehydrated.counts, r.counts);
                assert.strictEqual(typeof rehydrated.completedAt, 'number');
            });
            test('clears results but keeps ongoing tests', async () => {
                results.push(r);
                r.markComplete();
                const r2 = results.push(new testResult_1.LiveTestResult('', (0, exports.emptyOutputController)(), Object.assign(Object.assign({}, defaultOpts), { tests: [] })));
                results.clear();
                assert.deepStrictEqual(results.results, [r2]);
            });
            test('keeps ongoing tests on top', async () => {
                results.push(r);
                const r2 = results.push(new testResult_1.LiveTestResult('', (0, exports.emptyOutputController)(), Object.assign(Object.assign({}, defaultOpts), { tests: [] })));
                assert.deepStrictEqual(results.results, [r2, r]);
                r2.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
                r.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
            });
            const makeHydrated = async (completedAt = 42, state = testStubs_1.ReExportedTestRunState.Passed) => new testResult_1.HydratedTestResult({
                completedAt,
                id: 'some-id',
                tasks: [{ id: 't', running: false, name: undefined }],
                items: [Object.assign(Object.assign({}, (await (0, ownedTestCollection_1.getInitializedMainTestCollection)()).getNodeById('id-a')), { tasks: [{ state, duration: 0, messages: [] }], computedState: state, ownComputedState: state, retired: undefined, children: [] })]
            }, () => Promise.resolve((0, buffer_1.bufferToStream)(buffer_1.VSBuffer.alloc(0))));
            test('pushes hydrated results', async () => {
                results.push(r);
                const hydrated = await makeHydrated();
                results.push(hydrated);
                assert.deepStrictEqual(results.results, [r, hydrated]);
            });
            test('inserts in correct order', async () => {
                results.push(r);
                const hydrated1 = await makeHydrated();
                results.push(hydrated1);
                assert.deepStrictEqual(results.results, [r, hydrated1]);
            });
            test('inserts in correct order 2', async () => {
                results.push(r);
                const hydrated1 = await makeHydrated();
                results.push(hydrated1);
                const hydrated2 = await makeHydrated(30);
                results.push(hydrated2);
                assert.deepStrictEqual(results.results, [r, hydrated1, hydrated2]);
            });
        });
    });
});
//# sourceMappingURL=testResultService.test.js.map