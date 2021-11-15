/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/base/common/types"], function (require, exports, instantiation_1, uri_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResourceFileEdit = exports.ResourceTextEdit = exports.ResourceEdit = exports.IBulkEditService = void 0;
    exports.IBulkEditService = (0, instantiation_1.createDecorator)('IWorkspaceEditService');
    function isWorkspaceFileEdit(thing) {
        return (0, types_1.isObject)(thing) && (Boolean(thing.newUri) || Boolean(thing.oldUri));
    }
    function isWorkspaceTextEdit(thing) {
        return (0, types_1.isObject)(thing) && uri_1.URI.isUri(thing.resource) && (0, types_1.isObject)(thing.edit);
    }
    class ResourceEdit {
        constructor(metadata) {
            this.metadata = metadata;
        }
        static convert(edit) {
            return edit.edits.map(edit => {
                if (isWorkspaceTextEdit(edit)) {
                    return new ResourceTextEdit(edit.resource, edit.edit, edit.modelVersionId, edit.metadata);
                }
                if (isWorkspaceFileEdit(edit)) {
                    return new ResourceFileEdit(edit.oldUri, edit.newUri, edit.options, edit.metadata);
                }
                throw new Error('Unsupported edit');
            });
        }
    }
    exports.ResourceEdit = ResourceEdit;
    class ResourceTextEdit extends ResourceEdit {
        constructor(resource, textEdit, versionId, metadata) {
            super(metadata);
            this.resource = resource;
            this.textEdit = textEdit;
            this.versionId = versionId;
        }
    }
    exports.ResourceTextEdit = ResourceTextEdit;
    class ResourceFileEdit extends ResourceEdit {
        constructor(oldResource, newResource, options, metadata) {
            super(metadata);
            this.oldResource = oldResource;
            this.newResource = newResource;
            this.options = options;
        }
    }
    exports.ResourceFileEdit = ResourceFileEdit;
});
//# sourceMappingURL=bulkEditService.js.map