/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri", "vs/nls!vs/workbench/services/workspaces/browser/workspaceTrustEditorInput", "vs/workbench/common/editor"], function (require, exports, network_1, uri_1, nls_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustEditorInput = void 0;
    class WorkspaceTrustEditorInput extends editor_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeWorkspaceTrust,
                path: `workspaceTrustEditor`
            });
        }
        get typeId() {
            return WorkspaceTrustEditorInput.ID;
        }
        matches(otherInput) {
            return otherInput instanceof WorkspaceTrustEditorInput;
        }
        getName() {
            return (0, nls_1.localize)(0, null);
        }
    }
    exports.WorkspaceTrustEditorInput = WorkspaceTrustEditorInput;
    WorkspaceTrustEditorInput.ID = 'workbench.input.workspaceTrust';
});
//# sourceMappingURL=workspaceTrustEditorInput.js.map