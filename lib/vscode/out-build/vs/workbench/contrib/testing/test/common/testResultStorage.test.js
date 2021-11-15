/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/arrays", "vs/platform/log/common/log", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testStubs", "vs/workbench/contrib/testing/test/common/testResultService.test", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, arrays_1, log_1, testResult_1, testResultStorage_1, testStubs_1, testResultService_test_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - Test Result Storage', () => {
        let storage;
        const makeResult = (addMessage) => {
            const t = new testResult_1.LiveTestResult('', (0, testResultService_test_1.emptyOutputController)(), {
                tests: [],
                exclude: [],
                debug: false,
                id: 'x',
                persist: true,
            });
            t.addTask({ id: 't', name: undefined, running: true });
            const tests = testStubs_1.testStubs.nested();
            t.addTestChainToRun((0, testStubs_1.testStubsChain)(tests, ['id-a', 'id-aa']).map(testStubs_1.Convert.TestItem.from));
            if (addMessage) {
                t.appendMessage('id-a', 't', {
                    message: addMessage,
                    actualOutput: undefined,
                    expectedOutput: undefined,
                    location: undefined,
                    severity: 0,
                });
            }
            t.markComplete();
            return t;
        };
        const assertStored = async (stored) => assert.deepStrictEqual((await storage.read()).map(r => r.id), stored.map(s => s.id));
        setup(async () => {
            storage = new testResultStorage_1.InMemoryResultStorage(new workbenchTestServices_1.TestStorageService(), new log_1.NullLogService());
        });
        test('stores a single result', async () => {
            const r = (0, arrays_1.range)(5).map(() => makeResult());
            await storage.persist(r);
            await assertStored(r);
        });
        test('deletes old results', async () => {
            const r = (0, arrays_1.range)(5).map(() => makeResult());
            await storage.persist(r);
            const r2 = [makeResult(), ...r.slice(0, 3)];
            await storage.persist(r2);
            await assertStored(r2);
        });
        test('limits stored results', async () => {
            const r = (0, arrays_1.range)(100).map(() => makeResult());
            await storage.persist(r);
            await assertStored(r.slice(0, testResultStorage_1.RETAIN_MAX_RESULTS));
        });
        test('limits stored result by budget', async () => {
            const r = (0, arrays_1.range)(100).map(() => makeResult('a'.repeat(2048)));
            await storage.persist(r);
            await assertStored(r.slice(0, 44));
        });
        test('always stores the min number of results', async () => {
            const r = (0, arrays_1.range)(20).map(() => makeResult('a'.repeat(1024 * 10)));
            await storage.persist(r);
            await assertStored(r.slice(0, 16));
        });
        test('takes into account existing stored bytes', async () => {
            const r = (0, arrays_1.range)(10).map(() => makeResult('a'.repeat(1024 * 10)));
            await storage.persist(r);
            await assertStored(r);
            const r2 = [...r, ...(0, arrays_1.range)(10).map(() => makeResult('a'.repeat(1024 * 10)))];
            await storage.persist(r2);
            await assertStored(r2.slice(0, 16));
        });
    });
});
//# sourceMappingURL=testResultStorage.test.js.map