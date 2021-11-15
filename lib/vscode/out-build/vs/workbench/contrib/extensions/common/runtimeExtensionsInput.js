/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/base/common/uri", "vs/workbench/common/editor"], function (require, exports, nls, uri_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeExtensionsInput = void 0;
    class RuntimeExtensionsInput extends editor_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: 'runtime-extensions',
                path: 'default'
            });
        }
        get typeId() {
            return RuntimeExtensionsInput.ID;
        }
        static get instance() {
            if (!RuntimeExtensionsInput._instance || RuntimeExtensionsInput._instance.isDisposed()) {
                RuntimeExtensionsInput._instance = new RuntimeExtensionsInput();
            }
            return RuntimeExtensionsInput._instance;
        }
        getName() {
            return nls.localize(0, null);
        }
        canSplit() {
            return false;
        }
        matches(other) {
            return other instanceof RuntimeExtensionsInput;
        }
    }
    exports.RuntimeExtensionsInput = RuntimeExtensionsInput;
    RuntimeExtensionsInput.ID = 'workbench.runtimeExtensions.input';
});
//# sourceMappingURL=runtimeExtensionsInput.js.map