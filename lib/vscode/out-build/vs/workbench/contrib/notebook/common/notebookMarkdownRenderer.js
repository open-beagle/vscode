/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources"], function (require, exports, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookMarkupRendererInfo = void 0;
    class NotebookMarkupRendererInfo {
        constructor(descriptor) {
            this.id = descriptor.id;
            this.extensionId = descriptor.extension.identifier;
            this.extensionLocation = descriptor.extension.extensionLocation;
            this.entrypoint = (0, resources_1.joinPath)(this.extensionLocation, descriptor.entrypoint);
            this.displayName = descriptor.displayName;
            this.extensionIsBuiltin = descriptor.extension.isBuiltin;
            this.dependsOn = descriptor.dependsOn;
            this.mimeTypes = descriptor.mimeTypes;
        }
    }
    exports.NotebookMarkupRendererInfo = NotebookMarkupRendererInfo;
});
//# sourceMappingURL=notebookMarkdownRenderer.js.map