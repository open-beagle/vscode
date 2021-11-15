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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/base/common/types"], function (require, exports, dom_1, platform_1, editor_1, editorPane_1, telemetry_1, instantiation_1, themeService_1, colorRegistry_1, splitview_1, event_1, storage_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SideBySideEditor = void 0;
    let SideBySideEditor = class SideBySideEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, instantiationService, themeService, storageService) {
            super(SideBySideEditor.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.dimension = new dom_1.Dimension(0, 0);
            this.onDidCreateEditors = this._register(new event_1.Emitter());
            this._onDidChangeSizeConstraints = this._register(new event_1.Relay());
            this.onDidChangeSizeConstraints = event_1.Event.any(this.onDidCreateEditors.event, this._onDidChangeSizeConstraints.event);
        }
        get minimumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.minimumWidth : 0; }
        get maximumPrimaryWidth() { return this.primaryEditorPane ? this.primaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.minimumHeight : 0; }
        get maximumPrimaryHeight() { return this.primaryEditorPane ? this.primaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
        get minimumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumWidth : 0; }
        get maximumSecondaryWidth() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY; }
        get minimumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.minimumHeight : 0; }
        get maximumSecondaryHeight() { return this.secondaryEditorPane ? this.secondaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        set minimumHeight(value) { }
        set maximumHeight(value) { }
        get minimumWidth() { return this.minimumPrimaryWidth + this.minimumSecondaryWidth; }
        get maximumWidth() { return this.maximumPrimaryWidth + this.maximumSecondaryWidth; }
        get minimumHeight() { return this.minimumPrimaryHeight + this.minimumSecondaryHeight; }
        get maximumHeight() { return this.maximumPrimaryHeight + this.maximumSecondaryHeight; }
        createEditor(parent) {
            parent.classList.add('side-by-side-editor');
            const splitview = this.splitview = this._register(new splitview_1.SplitView(parent, { orientation: 1 /* HORIZONTAL */ }));
            this._register(this.splitview.onDidSashReset(() => splitview.distributeViewSizes()));
            this.secondaryEditorContainer = (0, dom_1.$)('.secondary-editor-container');
            this.splitview.addView({
                element: this.secondaryEditorContainer,
                layout: size => { var _a; return (_a = this.secondaryEditorPane) === null || _a === void 0 ? void 0 : _a.layout(new dom_1.Dimension(size, this.dimension.height)); },
                minimumSize: 220,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, splitview_1.Sizing.Distribute);
            this.primaryEditorContainer = (0, dom_1.$)('.primary-editor-container');
            this.splitview.addView({
                element: this.primaryEditorContainer,
                layout: size => { var _a; return (_a = this.primaryEditorPane) === null || _a === void 0 ? void 0 : _a.layout(new dom_1.Dimension(size, this.dimension.height)); },
                minimumSize: 220,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: event_1.Event.None
            }, splitview_1.Sizing.Distribute);
            this.updateStyles();
        }
        async setInput(newInput, options, context, token) {
            const oldInput = this.input;
            await super.setInput(newInput, options, context, token);
            return this.updateInput(oldInput, newInput, options, context, token);
        }
        setOptions(options) {
            if (this.primaryEditorPane) {
                this.primaryEditorPane.setOptions(options);
            }
        }
        setEditorVisible(visible, group) {
            if (this.primaryEditorPane) {
                this.primaryEditorPane.setVisible(visible, group);
            }
            if (this.secondaryEditorPane) {
                this.secondaryEditorPane.setVisible(visible, group);
            }
            super.setEditorVisible(visible, group);
        }
        clearInput() {
            if (this.primaryEditorPane) {
                this.primaryEditorPane.clearInput();
            }
            if (this.secondaryEditorPane) {
                this.secondaryEditorPane.clearInput();
            }
            this.disposeEditors();
            super.clearInput();
        }
        focus() {
            if (this.primaryEditorPane) {
                this.primaryEditorPane.focus();
            }
        }
        layout(dimension) {
            this.dimension = dimension;
            const splitview = (0, types_1.assertIsDefined)(this.splitview);
            splitview.layout(dimension.width);
        }
        getControl() {
            if (this.primaryEditorPane) {
                return this.primaryEditorPane.getControl();
            }
            return undefined;
        }
        getPrimaryEditorPane() {
            return this.primaryEditorPane;
        }
        getSecondaryEditorPane() {
            return this.secondaryEditorPane;
        }
        async updateInput(oldInput, newInput, options, context, token) {
            if (!newInput.matches(oldInput)) {
                if (oldInput) {
                    this.disposeEditors();
                }
                return this.setNewInput(newInput, options, context, token);
            }
            if (!this.secondaryEditorPane || !this.primaryEditorPane) {
                return;
            }
            await Promise.all([
                this.secondaryEditorPane.setInput(newInput.secondary, undefined, context, token),
                this.primaryEditorPane.setInput(newInput.primary, options, context, token)
            ]);
        }
        setNewInput(newInput, options, context, token) {
            const secondaryEditor = this.doCreateEditor(newInput.secondary, (0, types_1.assertIsDefined)(this.secondaryEditorContainer));
            const primaryEditor = this.doCreateEditor(newInput.primary, (0, types_1.assertIsDefined)(this.primaryEditorContainer));
            return this.onEditorsCreated(secondaryEditor, primaryEditor, newInput.secondary, newInput.primary, options, context, token);
        }
        doCreateEditor(editorInput, container) {
            const descriptor = platform_1.Registry.as(editor_1.EditorExtensions.Editors).getEditor(editorInput);
            if (!descriptor) {
                throw new Error('No descriptor for editor found');
            }
            const editor = descriptor.instantiate(this.instantiationService);
            editor.create(container);
            editor.setVisible(this.isVisible(), this.group);
            return editor;
        }
        async onEditorsCreated(secondary, primary, secondaryInput, primaryInput, options, context, token) {
            this.secondaryEditorPane = secondary;
            this.primaryEditorPane = primary;
            this._onDidChangeSizeConstraints.input = event_1.Event.any(event_1.Event.map(secondary.onDidChangeSizeConstraints, () => undefined), event_1.Event.map(primary.onDidChangeSizeConstraints, () => undefined));
            this.onDidCreateEditors.fire(undefined);
            await Promise.all([
                this.secondaryEditorPane.setInput(secondaryInput, undefined, context, token),
                this.primaryEditorPane.setInput(primaryInput, options, context, token)
            ]);
        }
        updateStyles() {
            super.updateStyles();
            if (this.primaryEditorContainer) {
                this.primaryEditorContainer.style.boxShadow = `-6px 0 5px -5px ${this.getColor(colorRegistry_1.scrollbarShadow)}`;
            }
        }
        disposeEditors() {
            if (this.secondaryEditorPane) {
                this.secondaryEditorPane.dispose();
                this.secondaryEditorPane = undefined;
            }
            if (this.primaryEditorPane) {
                this.primaryEditorPane.dispose();
                this.primaryEditorPane = undefined;
            }
            if (this.secondaryEditorContainer) {
                (0, dom_1.clearNode)(this.secondaryEditorContainer);
            }
            if (this.primaryEditorContainer) {
                (0, dom_1.clearNode)(this.primaryEditorContainer);
            }
        }
        dispose() {
            this.disposeEditors();
            super.dispose();
        }
    };
    SideBySideEditor.ID = 'workbench.editor.sidebysideEditor';
    SideBySideEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService)
    ], SideBySideEditor);
    exports.SideBySideEditor = SideBySideEditor;
});
//# sourceMappingURL=sideBySideEditor.js.map