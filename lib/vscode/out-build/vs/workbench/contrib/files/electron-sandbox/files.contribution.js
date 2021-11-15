/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/electron-sandbox/files.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/contrib/files/electron-sandbox/textFileEditor"], function (require, exports, nls, platform_1, editor_1, fileEditorInput_1, descriptors_1, editor_2, textFileEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register file editor
    platform_1.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(textFileEditor_1.NativeTextFileEditor, textFileEditor_1.NativeTextFileEditor.ID, nls.localize(0, null)), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
});
//# sourceMappingURL=files.contribution.js.map