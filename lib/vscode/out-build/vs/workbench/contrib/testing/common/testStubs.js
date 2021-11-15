/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/uri", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, cancellation_1, uri_1, extHostTypes_1, extHostTypes_2, Convert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReExportedTestRunState = exports.testStubs = exports.testStubsChain = exports.stubTest = exports.Convert = exports.TestResultState = exports.TestItemImpl = void 0;
    Object.defineProperty(exports, "TestItemImpl", { enumerable: true, get: function () { return extHostTypes_2.TestItemImpl; } });
    Object.defineProperty(exports, "TestResultState", { enumerable: true, get: function () { return extHostTypes_2.TestResultState; } });
    exports.Convert = Convert;
    const stubTest = (label, idPrefix = 'id-', children = [], uri = uri_1.URI.file('/')) => {
        const item = new extHostTypes_1.TestItemImpl(idPrefix + label, label, uri, undefined);
        if (children.length) {
            item.status = extHostTypes_1.TestItemStatus.Pending;
            item.resolveHandler = () => {
                for (const child of children) {
                    item.addChild(child);
                }
                item.status = extHostTypes_1.TestItemStatus.Resolved;
            };
        }
        return item;
    };
    exports.stubTest = stubTest;
    const testStubsChain = (stub, path, slice = 0) => {
        const tests = [stub];
        for (const segment of path) {
            if (stub.status !== extHostTypes_1.TestItemStatus.Resolved) {
                stub.resolveHandler(cancellation_1.CancellationToken.None);
            }
            stub = stub.children.get(segment);
            if (!stub) {
                throw new Error(`missing child ${segment}`);
            }
            tests.push(stub);
        }
        return tests.slice(slice);
    };
    exports.testStubsChain = testStubsChain;
    exports.testStubs = {
        test: exports.stubTest,
        nested: (idPrefix = 'id-') => (0, exports.stubTest)('root', idPrefix, [
            (0, exports.stubTest)('a', idPrefix, [(0, exports.stubTest)('aa', idPrefix), (0, exports.stubTest)('ab', idPrefix)]),
            (0, exports.stubTest)('b', idPrefix),
        ]),
    };
    exports.ReExportedTestRunState = extHostTypes_1.TestResultState;
});
//# sourceMappingURL=testStubs.js.map