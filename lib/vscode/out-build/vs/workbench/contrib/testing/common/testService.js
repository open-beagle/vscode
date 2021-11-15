/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation"], function (require, exports, cancellation_1, lifecycle_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAllTestsInHierarchy = exports.getTestByPath = exports.waitForAllRoots = exports.ITestService = void 0;
    exports.ITestService = (0, instantiation_1.createDecorator)('testService');
    const waitForAllRoots = (collection, ct = cancellation_1.CancellationToken.None) => {
        if (collection.pendingRootProviders === 0 || ct.isCancellationRequested) {
            return Promise.resolve();
        }
        const disposable = new lifecycle_1.DisposableStore();
        return new Promise(resolve => {
            disposable.add(collection.onPendingRootProvidersChange(count => {
                if (count === 0) {
                    resolve();
                }
            }));
            disposable.add(ct.onCancellationRequested(() => resolve()));
        }).finally(() => disposable.dispose());
    };
    exports.waitForAllRoots = waitForAllRoots;
    /**
     * Ensures the test with the given path exists in the collection, if possible.
     * If cancellation is requested, or the test cannot be found, it will return
     * undefined.
     */
    const getTestByPath = async (collection, idPath, ct = cancellation_1.CancellationToken.None) => {
        await (0, exports.waitForAllRoots)(collection, ct);
        // Expand all direct children since roots might well have different IDs, but
        // children should start matching.
        await Promise.all([...collection.rootIds].map(r => collection.expand(r, 0)));
        if (ct.isCancellationRequested) {
            return undefined;
        }
        let expandToLevel = 0;
        for (let i = idPath.length - 1; !ct.isCancellationRequested && i >= expandToLevel;) {
            const id = idPath[i];
            const existing = collection.getNodeById(id);
            if (!existing) {
                i--;
                continue;
            }
            if (i === idPath.length - 1) {
                return existing;
            }
            await collection.expand(id, 0);
            expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
            i = idPath.length - 1;
        }
        return undefined;
    };
    exports.getTestByPath = getTestByPath;
    /**
     * Waits for all test in the hierarchy to be fulfilled before returning.
     * If cancellation is requested, it will return early.
     */
    const getAllTestsInHierarchy = async (collection, ct = cancellation_1.CancellationToken.None) => {
        await (0, exports.waitForAllRoots)(collection, ct);
        if (ct.isCancellationRequested) {
            return;
        }
        let l;
        await Promise.race([
            Promise.all([...collection.rootIds].map(r => collection.expand(r, Infinity))),
            new Promise(r => { l = ct.onCancellationRequested(r); }),
        ]).finally(() => l === null || l === void 0 ? void 0 : l.dispose());
    };
    exports.getAllTestsInHierarchy = getAllTestsInHierarchy;
});
//# sourceMappingURL=testService.js.map