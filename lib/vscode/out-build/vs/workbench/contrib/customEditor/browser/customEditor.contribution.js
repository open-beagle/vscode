/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/contrib/customEditor/browser/customEditorInputFactory", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/webviewPanel/browser/webviewEditor", "./customEditorInput", "./customEditors"], function (require, exports, network_1, descriptors_1, extensions_1, platform_1, editor_1, editor_2, customEditorInputFactory_1, customEditor_1, webviewEditor_1, customEditorInput_1, customEditors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(customEditor_1.ICustomEditorService, customEditors_1.CustomEditorService);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors)
        .registerEditor(editor_1.EditorDescriptor.create(webviewEditor_1.WebviewEditor, webviewEditor_1.WebviewEditor.ID, 'Webview Editor'), [
        new descriptors_1.SyncDescriptor(customEditorInput_1.CustomEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories)
        .registerEditorInputSerializer(customEditorInputFactory_1.CustomEditorInputSerializer.ID, customEditorInputFactory_1.CustomEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories)
        .registerCustomEditorInputFactory(network_1.Schemas.vscodeCustomEditor, customEditorInputFactory_1.customEditorInputFactory);
});
//# sourceMappingURL=customEditor.contribution.js.map