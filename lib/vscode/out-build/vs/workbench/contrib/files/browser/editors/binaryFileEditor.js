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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/editors/binaryFileEditor", "vs/workbench/browser/parts/editor/binaryEditor", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/contrib/files/common/files", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorService", "vs/platform/editor/common/editor", "vs/workbench/services/editor/common/editorOverrideService"], function (require, exports, nls_1, binaryEditor_1, telemetry_1, themeService_1, fileEditorInput_1, files_1, storage_1, editorService_1, editor_1, editorOverrideService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryFileEditor = void 0;
    /**
     * An implementation of editor for binary files that cannot be displayed.
     */
    let BinaryFileEditor = class BinaryFileEditor extends binaryEditor_1.BaseBinaryResourceEditor {
        constructor(telemetryService, themeService, editorService, editorOverrideService, storageService) {
            super(BinaryFileEditor.ID, {
                openInternal: (input, options) => this.openInternal(input, options)
            }, telemetryService, themeService, storageService);
            this.editorService = editorService;
            this.editorOverrideService = editorOverrideService;
        }
        async openInternal(input, options) {
            var _a, _b, _c;
            if (input instanceof fileEditorInput_1.FileEditorInput && this.group) {
                // Enforce to open the input as text to enable our text based viewer
                input.setForceOpenAsText();
                // Try to let the user pick an override if there is one availabe
                const overridenInput = await this.editorOverrideService.resolveEditorOverride(input, Object.assign(Object.assign({}, options), { override: editor_1.EditorOverride.PICK }), this.group);
                let newOptions = (_a = overridenInput === null || overridenInput === void 0 ? void 0 : overridenInput.options) !== null && _a !== void 0 ? _a : options;
                newOptions = Object.assign(Object.assign({}, newOptions), { override: editor_1.EditorOverride.DISABLED });
                // Replace the overrriden input, with the text based input
                await this.editorService.replaceEditors([{
                        editor: input,
                        replacement: (_b = overridenInput === null || overridenInput === void 0 ? void 0 : overridenInput.editor) !== null && _b !== void 0 ? _b : input,
                        options: newOptions,
                    }], (_c = overridenInput === null || overridenInput === void 0 ? void 0 : overridenInput.group) !== null && _c !== void 0 ? _c : this.group);
            }
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)(0, null);
        }
    };
    BinaryFileEditor.ID = files_1.BINARY_FILE_EDITOR_ID;
    BinaryFileEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, editorService_1.IEditorService),
        __param(3, editorOverrideService_1.IEditorOverrideService),
        __param(4, storage_1.IStorageService)
    ], BinaryFileEditor);
    exports.BinaryFileEditor = BinaryFileEditor;
});
//# sourceMappingURL=binaryFileEditor.js.map