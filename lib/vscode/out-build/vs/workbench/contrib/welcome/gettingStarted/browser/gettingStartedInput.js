/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedInput", "vs/workbench/common/editor", "vs/base/common/uri", "vs/base/common/network", "vs/css!./gettingStarted"], function (require, exports, nls_1, editor_1, uri_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedInput = exports.gettingStartedInputTypeId = void 0;
    exports.gettingStartedInputTypeId = 'workbench.editors.gettingStartedInput';
    class GettingStartedInput extends editor_1.EditorInput {
        constructor(options) {
            super();
            this.selectedCategory = options.selectedCategory;
            this.selectedStep = options.selectedStep;
        }
        get typeId() {
            return GettingStartedInput.ID;
        }
        get resource() {
            return uri_1.URI.from({ scheme: network_1.Schemas.walkThrough, authority: 'vscode_getting_started_page' });
        }
        matches(other) {
            if (other instanceof GettingStartedInput) {
                return other.selectedCategory === this.selectedCategory;
            }
            return false;
        }
        getName() {
            return (0, nls_1.localize)(0, null);
        }
    }
    exports.GettingStartedInput = GettingStartedInput;
    GettingStartedInput.ID = exports.gettingStartedInputTypeId;
});
//# sourceMappingURL=gettingStartedInput.js.map