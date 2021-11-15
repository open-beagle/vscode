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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/binaryEditor", "vs/base/common/event", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor/binaryEditorModel", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/files/common/files", "vs/css!./media/binaryeditor"], function (require, exports, nls_1, event_1, editorPane_1, binaryEditorModel_1, scrollableElement_1, dom_1, lifecycle_1, storage_1, types_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseBinaryResourceEditor = void 0;
    /*
     * This class is only intended to be subclassed and not instantiated.
     */
    let BaseBinaryResourceEditor = class BaseBinaryResourceEditor extends editorPane_1.EditorPane {
        constructor(id, callbacks, telemetryService, themeService, storageService) {
            super(id, telemetryService, themeService, storageService);
            this._onDidChangeMetadata = this._register(new event_1.Emitter());
            this.onDidChangeMetadata = this._onDidChangeMetadata.event;
            this._onDidOpenInPlace = this._register(new event_1.Emitter());
            this.onDidOpenInPlace = this._onDidOpenInPlace.event;
            this.inputDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.callbacks = callbacks;
        }
        getTitle() {
            return this.input ? this.input.getName() : (0, nls_1.localize)(0, null);
        }
        createEditor(parent) {
            // Container for Binary
            this.binaryContainer = document.createElement('div');
            this.binaryContainer.className = 'monaco-binary-resource-editor';
            this.binaryContainer.style.outline = 'none';
            this.binaryContainer.tabIndex = 0; // enable focus support from the editor part (do not remove)
            // Custom Scrollbars
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.binaryContainer, { horizontal: 1 /* Auto */, vertical: 1 /* Auto */ }));
            parent.appendChild(this.scrollbar.getDomNode());
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }
            // Assert Model instance
            if (!(model instanceof binaryEditorModel_1.BinaryEditorModel)) {
                throw new Error('Unable to open file as binary');
            }
            // Render Input
            this.inputDisposable.value = this.renderInput(input, options, model);
        }
        renderInput(input, options, model) {
            const [binaryContainer, scrollbar] = (0, types_1.assertAllDefined)(this.binaryContainer, this.scrollbar);
            (0, dom_1.clearNode)(binaryContainer);
            const disposables = new lifecycle_1.DisposableStore();
            const label = document.createElement('p');
            label.textContent = (0, nls_1.localize)(1, null);
            binaryContainer.appendChild(label);
            const link = (0, dom_1.append)(label, (0, dom_1.$)('a.embedded-link'));
            link.setAttribute('role', 'button');
            link.textContent = (0, nls_1.localize)(2, null);
            disposables.add((0, dom_1.addDisposableListener)(link, dom_1.EventType.CLICK, async () => {
                await this.callbacks.openInternal(input, options);
                // Signal to listeners that the binary editor has been opened in-place
                this._onDidOpenInPlace.fire();
            }));
            scrollbar.scanDomNode();
            // Update metadata
            const size = model.getSize();
            this.handleMetadataChanged(typeof size === 'number' ? files_1.ByteSize.formatSize(size) : '');
            return disposables;
        }
        handleMetadataChanged(meta) {
            this.metadata = meta;
            this._onDidChangeMetadata.fire();
        }
        getMetadata() {
            return this.metadata;
        }
        clearInput() {
            // Clear Meta
            this.handleMetadataChanged(undefined);
            // Clear the rest
            if (this.binaryContainer) {
                (0, dom_1.clearNode)(this.binaryContainer);
            }
            this.inputDisposable.clear();
            super.clearInput();
        }
        layout(dimension) {
            // Pass on to Binary Container
            const [binaryContainer, scrollbar] = (0, types_1.assertAllDefined)(this.binaryContainer, this.scrollbar);
            (0, dom_1.size)(binaryContainer, dimension.width, dimension.height);
            scrollbar.scanDomNode();
        }
        focus() {
            const binaryContainer = (0, types_1.assertIsDefined)(this.binaryContainer);
            binaryContainer.focus();
        }
        dispose() {
            var _a;
            (_a = this.binaryContainer) === null || _a === void 0 ? void 0 : _a.remove();
            super.dispose();
        }
    };
    BaseBinaryResourceEditor = __decorate([
        __param(4, storage_1.IStorageService)
    ], BaseBinaryResourceEditor);
    exports.BaseBinaryResourceEditor = BaseBinaryResourceEditor;
});
//# sourceMappingURL=binaryEditor.js.map