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
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/node/pfs", "vs/platform/product/common/productService"], function (require, exports, fs_1, path_1, errors_1, lifecycle_1, pfs_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeCachedDataCleaner = void 0;
    let NodeCachedDataCleaner = class NodeCachedDataCleaner {
        constructor(nodeCachedDataDir, productService) {
            this.nodeCachedDataDir = nodeCachedDataDir;
            this.productService = productService;
            this._DataMaxAge = this.productService.quality !== 'stable'
                ? 1000 * 60 * 60 * 24 * 7 // roughly 1 week
                : 1000 * 60 * 60 * 24 * 30 * 3; // roughly 3 months
            this._disposables = new lifecycle_1.DisposableStore();
            this._manageCachedDataSoon();
        }
        dispose() {
            this._disposables.dispose();
        }
        _manageCachedDataSoon() {
            // Cached data is stored as user data and we run a cleanup task everytime
            // the editor starts. The strategy is to delete all files that are older than
            // 3 months (1 week respectively)
            if (!this.nodeCachedDataDir) {
                return;
            }
            // The folder which contains folders of cached data. Each of these folder is per
            // version
            const nodeCachedDataRootDir = (0, path_1.dirname)(this.nodeCachedDataDir);
            const nodeCachedDataCurrent = (0, path_1.basename)(this.nodeCachedDataDir);
            let handle = setTimeout(() => {
                handle = undefined;
                (0, pfs_1.readdir)(nodeCachedDataRootDir).then(entries => {
                    const now = Date.now();
                    const deletes = [];
                    entries.forEach(entry => {
                        // name check
                        // * not the current cached data folder
                        if (entry !== nodeCachedDataCurrent) {
                            const path = (0, path_1.join)(nodeCachedDataRootDir, entry);
                            deletes.push(fs_1.promises.stat(path).then(stats => {
                                // stat check
                                // * only directories
                                // * only when old enough
                                if (stats.isDirectory()) {
                                    const diff = now - stats.mtime.getTime();
                                    if (diff > this._DataMaxAge) {
                                        return (0, pfs_1.rimraf)(path);
                                    }
                                }
                                return undefined;
                            }));
                        }
                    });
                    return Promise.all(deletes);
                }).then(undefined, errors_1.onUnexpectedError);
            }, 30 * 1000);
            this._disposables.add((0, lifecycle_1.toDisposable)(() => {
                if (handle) {
                    clearTimeout(handle);
                    handle = undefined;
                }
            }));
        }
    };
    NodeCachedDataCleaner = __decorate([
        __param(1, productService_1.IProductService)
    ], NodeCachedDataCleaner);
    exports.NodeCachedDataCleaner = NodeCachedDataCleaner;
});
//# sourceMappingURL=nodeCachedDataCleaner.js.map