/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/resources"], function (require, exports, glob, iterator_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookOutputRendererInfo = void 0;
    class DependencyList {
        constructor(value) {
            this.value = new Set(value);
            this.defined = this.value.size > 0;
        }
        /** Gets whether any of the 'available' dependencies match the ones in this list */
        matches(available) {
            // For now this is simple, but this may expand to support globs later
            // @see https://github.com/microsoft/vscode/issues/119899
            return available.some(v => this.value.has(v));
        }
    }
    class NotebookOutputRendererInfo {
        constructor(descriptor) {
            var _a, _b;
            // todo: re-add preloads in pure renderer API
            this.preloads = [];
            this.id = descriptor.id;
            this.extensionId = descriptor.extension.identifier;
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.entrypoint = (0, resources_1.joinPath)(this.extensionLocation, descriptor.entrypoint);
            this.displayName = descriptor.displayName;
            this.mimeTypes = descriptor.mimeTypes;
            this.mimeTypeGlobs = this.mimeTypes.map(pattern => glob.parse(pattern));
            this.hardDependencies = new DependencyList((_a = descriptor.dependencies) !== null && _a !== void 0 ? _a : iterator_1.Iterable.empty());
            this.optionalDependencies = new DependencyList((_b = descriptor.optionalDependencies) !== null && _b !== void 0 ? _b : iterator_1.Iterable.empty());
        }
        matchesWithoutKernel(mimeType) {
            if (!this.matchesMimeTypeOnly(mimeType)) {
                return 3 /* Never */;
            }
            if (this.hardDependencies.defined) {
                return 0 /* WithHardKernelDependency */;
            }
            if (this.optionalDependencies.defined) {
                return 1 /* WithOptionalKernelDependency */;
            }
            return 2 /* Pure */;
        }
        matches(mimeType, kernelProvides) {
            if (!this.matchesMimeTypeOnly(mimeType)) {
                return 3 /* Never */;
            }
            if (this.hardDependencies.defined) {
                return this.hardDependencies.matches(kernelProvides)
                    ? 0 /* WithHardKernelDependency */
                    : 3 /* Never */;
            }
            return this.optionalDependencies.matches(kernelProvides)
                ? 1 /* WithOptionalKernelDependency */
                : 2 /* Pure */;
        }
        matchesMimeTypeOnly(mimeType) {
            return this.mimeTypeGlobs.some(pattern => pattern(mimeType)) || this.mimeTypes.some(pattern => pattern === mimeType);
        }
    }
    exports.NotebookOutputRendererInfo = NotebookOutputRendererInfo;
});
//# sourceMappingURL=notebookOutputRenderer.js.map