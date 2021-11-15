/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/uri", "vs/workbench/api/common/extHostTesting", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/contrib/testing/common/testStubs", "vs/workbench/contrib/testing/test/common/ownedTestCollection"], function (require, exports, assert, cancellation_1, uri_1, extHostTesting_1, convert, testStubs_1, ownedTestCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const simplify = (item) => ({
        id: item.id,
        label: item.label,
        uri: item.uri,
        range: item.range,
        runnable: item.runnable,
        debuggable: item.debuggable,
    });
    const assertTreesEqual = (a, b) => {
        if (!a) {
            throw new assert.AssertionError({ message: 'Expected a to be defined', actual: a });
        }
        if (!b) {
            throw new assert.AssertionError({ message: 'Expected b to be defined', actual: b });
        }
        assert.deepStrictEqual(simplify(a), simplify(b));
        const aChildren = [...a.children.keys()].slice().sort();
        const bChildren = [...b.children.keys()].slice().sort();
        assert.strictEqual(aChildren.length, bChildren.length, `expected ${a.label}.children.length == ${b.label}.children.length`);
        aChildren.forEach(key => assertTreesEqual(a.children.get(key), b.children.get(key)));
    };
    // const assertTreeListEqual = (a: ReadonlyArray<TestItem>, b: ReadonlyArray<TestItem>) => {
    // 	assert.strictEqual(a.length, b.length, `expected a.length == n.length`);
    // 	a.forEach((_, i) => assertTreesEqual(a[i], b[i]));
    // };
    // class TestMirroredCollection extends MirroredTestCollection {
    // 	public changeEvent!: TestChangeEvent;
    // 	constructor() {
    // 		super();
    // 		this.onDidChangeTests(evt => this.changeEvent = evt);
    // 	}
    // 	public get length() {
    // 		return this.items.size;
    // 	}
    // }
    suite('ExtHost Testing', () => {
        let single;
        let owned;
        setup(() => {
            owned = new ownedTestCollection_1.TestOwnedTestCollection();
            single = owned.createForHierarchy(d => single.setDiff(d /* don't clear during testing */));
        });
        teardown(() => {
            var _a;
            single.dispose();
            assert.strictEqual(!((_a = owned.idToInternal) === null || _a === void 0 ? void 0 : _a.size), true, 'expected owned ids to be empty after dispose');
        });
        suite('OwnedTestCollection', () => {
            test('adds a root recursively', () => {
                const tests = testStubs_1.testStubs.nested();
                single.addRoot(tests, 'pid');
                single.expand('id-root', Infinity);
                assert.deepStrictEqual(single.collectDiff(), [
                    [
                        0 /* Add */,
                        { src: { tree: 0, controller: 'pid' }, parent: null, expand: 2 /* BusyExpanding */, item: Object.assign({}, convert.TestItem.from((0, testStubs_1.stubTest)('root'))) }
                    ],
                    [
                        0 /* Add */,
                        { src: { tree: 0, controller: 'pid' }, parent: 'id-root', expand: 1 /* Expandable */, item: Object.assign({}, convert.TestItem.from((0, testStubs_1.stubTest)('a'))) }
                    ],
                    [
                        0 /* Add */,
                        { src: { tree: 0, controller: 'pid' }, parent: 'id-root', expand: 0 /* NotExpandable */, item: convert.TestItem.from((0, testStubs_1.stubTest)('b')) }
                    ],
                    [
                        1 /* Update */,
                        { extId: 'id-root', expand: 3 /* Expanded */ }
                    ],
                    [
                        1 /* Update */,
                        { extId: 'id-a', expand: 2 /* BusyExpanding */ }
                    ],
                    [
                        0 /* Add */,
                        { src: { tree: 0, controller: 'pid' }, parent: 'id-a', expand: 0 /* NotExpandable */, item: convert.TestItem.from((0, testStubs_1.stubTest)('aa')) }
                    ],
                    [
                        0 /* Add */,
                        { src: { tree: 0, controller: 'pid' }, parent: 'id-a', expand: 0 /* NotExpandable */, item: convert.TestItem.from((0, testStubs_1.stubTest)('ab')) }
                    ],
                    [
                        1 /* Update */,
                        { extId: 'id-a', expand: 3 /* Expanded */ }
                    ],
                ]);
            });
            test('no-ops if items not changed', () => {
                const tests = testStubs_1.testStubs.nested();
                single.addRoot(tests, 'pid');
                single.collectDiff();
                assert.deepStrictEqual(single.collectDiff(), []);
            });
            test('watches property mutations', () => {
                const tests = testStubs_1.testStubs.nested();
                single.addRoot(tests, 'pid');
                single.expand('id-root', Infinity);
                single.collectDiff();
                tests.children.get('id-a').description = 'Hello world'; /* item a */
                assert.deepStrictEqual(single.collectDiff(), [
                    [
                        1 /* Update */,
                        { extId: 'id-a', item: { description: 'Hello world' } }
                    ],
                ]);
            });
            test('removes children', () => {
                const tests = testStubs_1.testStubs.nested();
                single.addRoot(tests, 'pid');
                single.expand('id-root', Infinity);
                single.collectDiff();
                tests.children.get('id-a').dispose();
                assert.deepStrictEqual(single.collectDiff(), [
                    [2 /* Remove */, 'id-a'],
                ]);
                assert.deepStrictEqual([...owned.idToInternal].map(n => n.item.extId).sort(), ['id-b', 'id-root']);
                assert.strictEqual(single.itemToInternal.size, 2);
            });
            test('adds new children', () => {
                const tests = testStubs_1.testStubs.nested();
                single.addRoot(tests, 'pid');
                single.expand('id-root', Infinity);
                single.collectDiff();
                const child = (0, testStubs_1.stubTest)('ac');
                tests.children.get('id-a').addChild(child);
                assert.deepStrictEqual(single.collectDiff(), [
                    [0 /* Add */, {
                            src: { tree: 0, controller: 'pid' },
                            parent: 'id-a',
                            expand: 0 /* NotExpandable */,
                            item: convert.TestItem.from(child),
                        }],
                ]);
                assert.deepStrictEqual([...owned.idToInternal].map(n => n.item.extId).sort(), ['id-a', 'id-aa', 'id-ab', 'id-ac', 'id-b', 'id-root']);
                assert.strictEqual(single.itemToInternal.size, 6);
            });
        });
        suite('MirroredTestCollection', () => {
            // todo@connor4312: re-renable when we figure out what observing looks like we async children
            // 	let m: TestMirroredCollection;
            // 	setup(() => m = new TestMirroredCollection());
            // 	test('mirrors creation of the root', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		single.expand('id-root', Infinity);
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById('id-root')![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node deletion', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		single.expand('id-root', Infinity);
            // 		tests.children!.splice(0, 1);
            // 		single.onItemChange(tests, 'pid');
            // 		single.expand('id-root', Infinity);
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById('id-root')![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node addition', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		tests.children![0].children!.push(stubTest('ac'));
            // 		single.onItemChange(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById('id-root')![1].actual);
            // 		assert.strictEqual(m.length, single.itemToInternal.size);
            // 	});
            // 	test('mirrors node update', () => {
            // 		const tests = testStubs.nested();
            // 		single.addRoot(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		tests.children![0].description = 'Hello world'; /* item a */
            // 		single.onItemChange(tests, 'pid');
            // 		m.apply(single.collectDiff());
            // 		assertTreesEqual(m.rootTestItems[0], owned.getTestById('id-root')![1].actual);
            // 	});
            // 	suite('MirroredChangeCollector', () => {
            // 		let tests = testStubs.nested();
            // 		setup(() => {
            // 			tests = testStubs.nested();
            // 			single.addRoot(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 		test('creates change for root', () => {
            // 			assertTreeListEqual(m.changeEvent.added, [
            // 				tests,
            // 				tests.children[0],
            // 				tests.children![0].children![0],
            // 				tests.children![0].children![1],
            // 				tests.children[1],
            // 			]);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('creates change for delete', () => {
            // 			const rm = tests.children.shift()!;
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, []);
            // 			assertTreeListEqual(m.changeEvent.removed, [
            // 				{ ...rm },
            // 				{ ...rm.children![0] },
            // 				{ ...rm.children![1] },
            // 			]);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('creates change for update', () => {
            // 			tests.children[0].label = 'updated!';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, []);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, [tests.children[0]]);
            // 		});
            // 		test('is a no-op if a node is added and removed', () => {
            // 			const nested = testStubs.nested('id2-');
            // 			tests.children.push(nested);
            // 			single.onItemChange(tests, 'pid');
            // 			tests.children.pop();
            // 			single.onItemChange(tests, 'pid');
            // 			const previousEvent = m.changeEvent;
            // 			m.apply(single.collectDiff());
            // 			assert.strictEqual(m.changeEvent, previousEvent);
            // 		});
            // 		test('is a single-op if a node is added and changed', () => {
            // 			const child = stubTest('c');
            // 			tests.children.push(child);
            // 			single.onItemChange(tests, 'pid');
            // 			child.label = 'd';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 			assertTreeListEqual(m.changeEvent.added, [child]);
            // 			assertTreeListEqual(m.changeEvent.removed, []);
            // 			assertTreeListEqual(m.changeEvent.updated, []);
            // 		});
            // 		test('gets the common ancestor (1)', () => {
            // 			tests.children![0].children![0].label = 'za';
            // 			tests.children![0].children![1].label = 'zb';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 		test('gets the common ancestor (2)', () => {
            // 			tests.children![0].children![0].label = 'za';
            // 			tests.children![1].label = 'ab';
            // 			single.onItemChange(tests, 'pid');
            // 			m.apply(single.collectDiff());
            // 		});
            // 	});
            suite('TestItemFilteredWrapper', () => {
                const textDocumentFilter = {
                    uri: uri_1.URI.parse('file:///foo.ts'),
                };
                let testsWithLocation;
                setup(async () => {
                    testsWithLocation =
                        (0, testStubs_1.stubTest)('root', undefined, [
                            (0, testStubs_1.stubTest)('a', undefined, [
                                (0, testStubs_1.stubTest)('aa', undefined, undefined, uri_1.URI.parse('file:///foo.ts')),
                                (0, testStubs_1.stubTest)('ab', undefined, undefined, uri_1.URI.parse('file:///foo.ts'))
                            ], uri_1.URI.parse('file:///foo.ts')),
                            (0, testStubs_1.stubTest)('b', undefined, [
                                (0, testStubs_1.stubTest)('ba', undefined, undefined, uri_1.URI.parse('file:///bar.ts')),
                                (0, testStubs_1.stubTest)('bb', undefined, undefined, uri_1.URI.parse('file:///bar.ts'))
                            ], uri_1.URI.parse('file:///bar.ts')),
                            (0, testStubs_1.stubTest)('c', undefined, undefined, uri_1.URI.parse('file:///baz.ts')),
                        ]);
                    // todo: this is not used, don't think it's needed anymore
                    await (0, extHostTesting_1.createDefaultDocumentTestRoot)({
                        createWorkspaceTestRoot: () => testsWithLocation,
                        runTests() {
                            throw new Error('no implemented');
                        }
                    }, textDocumentFilter, undefined, cancellation_1.CancellationToken.None);
                });
                teardown(() => {
                    extHostTesting_1.TestItemFilteredWrapper.removeFilter(textDocumentFilter);
                });
                test('gets all actual properties', () => {
                    const testItem = (0, testStubs_1.stubTest)('test1');
                    const wrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(testItem, textDocumentFilter);
                    assert.strictEqual(testItem.debuggable, wrapper.debuggable);
                    assert.strictEqual(testItem.description, wrapper.description);
                    assert.strictEqual(testItem.label, wrapper.label);
                    assert.strictEqual(testItem.uri, wrapper.uri);
                    assert.strictEqual(testItem.runnable, wrapper.runnable);
                });
                test('gets no children if nothing matches Uri filter', () => {
                    var _a;
                    const tests = testStubs_1.testStubs.nested();
                    const wrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(tests, textDocumentFilter);
                    (_a = wrapper.resolveHandler) === null || _a === void 0 ? void 0 : _a.call(wrapper, cancellation_1.CancellationToken.None);
                    assert.strictEqual(wrapper.children.size, 0);
                });
                test('filter is applied to children', () => {
                    var _a;
                    const wrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(testsWithLocation, textDocumentFilter);
                    assert.strictEqual(wrapper.label, 'root');
                    (_a = wrapper.resolveHandler) === null || _a === void 0 ? void 0 : _a.call(wrapper, cancellation_1.CancellationToken.None);
                    const children = [...wrapper.children.values()];
                    assert.strictEqual(children.length, 1);
                    assert.strictEqual(children[0] instanceof extHostTesting_1.TestItemFilteredWrapper, true);
                    assert.strictEqual(children[0].label, 'a');
                });
                test('can get if node has matching filter', () => {
                    var _a;
                    const rootWrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(testsWithLocation, textDocumentFilter);
                    (_a = rootWrapper.resolveHandler) === null || _a === void 0 ? void 0 : _a.call(rootWrapper, cancellation_1.CancellationToken.None);
                    const invisible = testsWithLocation.children.get('id-b');
                    const invisibleWrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(invisible, textDocumentFilter);
                    const visible = testsWithLocation.children.get('id-a');
                    const visibleWrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(visible, textDocumentFilter);
                    // The root is always visible
                    assert.strictEqual(rootWrapper.hasNodeMatchingFilter, true);
                    assert.strictEqual(invisibleWrapper.hasNodeMatchingFilter, false);
                    assert.strictEqual(visibleWrapper.hasNodeMatchingFilter, true);
                });
                test('can reset cached value of hasNodeMatchingFilter', () => {
                    var _a;
                    const wrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(testsWithLocation, textDocumentFilter);
                    (_a = wrapper.resolveHandler) === null || _a === void 0 ? void 0 : _a.call(wrapper, cancellation_1.CancellationToken.None);
                    const invisible = testsWithLocation.children.get('id-b');
                    const invisibleWrapper = extHostTesting_1.TestItemFilteredWrapper.getWrapperForTestItem(invisible, textDocumentFilter);
                    assert.strictEqual(wrapper.children.get('id-b'), undefined);
                    assert.strictEqual(invisibleWrapper.hasNodeMatchingFilter, false);
                    invisible.addChild((0, testStubs_1.stubTest)('bc', undefined, undefined, uri_1.URI.parse('file:///foo.ts')));
                    assert.strictEqual(invisibleWrapper.hasNodeMatchingFilter, true);
                    assert.strictEqual(invisibleWrapper.children.size, 1);
                    assert.strictEqual(wrapper.children.get('id-b'), invisibleWrapper);
                });
                // test('can reset cached value of hasNodeMatchingFilter of parents up to visible parent', () => {
                // 	const rootWrapper = TestItemFilteredWrapper.getWrapperForTestItem(testsWithLocation, textDocumentFilter);
                // 	const invisibleParent = testsWithLocation.children.get('id-b')!;
                // 	const invisibleParentWrapper = TestItemFilteredWrapper.getWrapperForTestItem(invisibleParent, textDocumentFilter);
                // 	const invisible = invisibleParent.children.get('id-bb')!;
                // 	const invisibleWrapper = TestItemFilteredWrapper.getWrapperForTestItem(invisible, textDocumentFilter);
                // 	assert.strictEqual(invisibleParentWrapper.hasNodeMatchingFilter, false);
                // 	invisible.location = location1 as any;
                // 	assert.strictEqual(invisibleParentWrapper.hasNodeMatchingFilter, false);
                // 	invisibleWrapper.reset();
                // 	assert.strictEqual(invisibleParentWrapper.hasNodeMatchingFilter, true);
                // 	// the root should be undefined due to the reset.
                // 	assert.strictEqual((rootWrapper as any).matchesFilter, undefined);
                // });
            });
        });
    });
});
//# sourceMappingURL=extHostTesting.test.js.map