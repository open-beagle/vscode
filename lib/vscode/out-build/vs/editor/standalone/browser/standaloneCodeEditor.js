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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/lifecycle", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditorWidget", "vs/editor/common/editorAction", "vs/editor/common/services/editorWorkerService", "vs/editor/standalone/browser/simpleServices", "vs/editor/standalone/common/standaloneThemeService", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/platform/accessibility/common/accessibility", "vs/editor/common/standaloneStrings", "vs/platform/clipboard/common/clipboardService", "vs/platform/progress/common/progress", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService"], function (require, exports, aria, lifecycle_1, codeEditorService_1, codeEditorWidget_1, diffEditorWidget_1, editorAction_1, editorWorkerService_1, simpleServices_1, standaloneThemeService_1, actions_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, notification_1, themeService_1, accessibility_1, standaloneStrings_1, clipboardService_1, progress_1, modelService_1, modeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTextModel = exports.StandaloneDiffEditor = exports.StandaloneEditor = exports.StandaloneCodeEditor = void 0;
    let LAST_GENERATED_COMMAND_ID = 0;
    let ariaDomNodeCreated = false;
    function createAriaDomNode() {
        if (ariaDomNodeCreated) {
            return;
        }
        ariaDomNodeCreated = true;
        aria.setARIAContainer(document.body);
    }
    /**
     * A code editor to be used both by the standalone editor and the standalone diff editor.
     */
    let StandaloneCodeEditor = class StandaloneCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor(domElement, _options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService) {
            const options = Object.assign({}, _options);
            options.ariaLabel = options.ariaLabel || standaloneStrings_1.StandaloneCodeEditorNLS.editorViewAccessibleLabel;
            options.ariaLabel = options.ariaLabel + ';' + (standaloneStrings_1.StandaloneCodeEditorNLS.accessibilityHelpMessage);
            super(domElement, options, {}, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService);
            if (keybindingService instanceof simpleServices_1.StandaloneKeybindingService) {
                this._standaloneKeybindingService = keybindingService;
            }
            else {
                this._standaloneKeybindingService = null;
            }
            // Create the ARIA dom node as soon as the first editor is instantiated
            createAriaDomNode();
        }
        addCommand(keybinding, handler, context) {
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add command because the editor is configured with an unrecognized KeybindingService');
                return null;
            }
            let commandId = 'DYNAMIC_' + (++LAST_GENERATED_COMMAND_ID);
            let whenExpression = contextkey_1.ContextKeyExpr.deserialize(context);
            this._standaloneKeybindingService.addDynamicKeybinding(commandId, keybinding, handler, whenExpression);
            return commandId;
        }
        createContextKey(key, defaultValue) {
            return this._contextKeyService.createKey(key, defaultValue);
        }
        addAction(_descriptor) {
            if ((typeof _descriptor.id !== 'string') || (typeof _descriptor.label !== 'string') || (typeof _descriptor.run !== 'function')) {
                throw new Error('Invalid action descriptor, `id`, `label` and `run` are required properties!');
            }
            if (!this._standaloneKeybindingService) {
                console.warn('Cannot add keybinding because the editor is configured with an unrecognized KeybindingService');
                return lifecycle_1.Disposable.None;
            }
            // Read descriptor options
            const id = _descriptor.id;
            const label = _descriptor.label;
            const precondition = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('editorId', this.getId()), contextkey_1.ContextKeyExpr.deserialize(_descriptor.precondition));
            const keybindings = _descriptor.keybindings;
            const keybindingsWhen = contextkey_1.ContextKeyExpr.and(precondition, contextkey_1.ContextKeyExpr.deserialize(_descriptor.keybindingContext));
            const contextMenuGroupId = _descriptor.contextMenuGroupId || null;
            const contextMenuOrder = _descriptor.contextMenuOrder || 0;
            const run = (accessor, ...args) => {
                return Promise.resolve(_descriptor.run(this, ...args));
            };
            const toDispose = new lifecycle_1.DisposableStore();
            // Generate a unique id to allow the same descriptor.id across multiple editor instances
            const uniqueId = this.getId() + ':' + id;
            // Register the command
            toDispose.add(commands_1.CommandsRegistry.registerCommand(uniqueId, run));
            // Register the context menu item
            if (contextMenuGroupId) {
                let menuItem = {
                    command: {
                        id: uniqueId,
                        title: label
                    },
                    when: precondition,
                    group: contextMenuGroupId,
                    order: contextMenuOrder
                };
                toDispose.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, menuItem));
            }
            // Register the keybindings
            if (Array.isArray(keybindings)) {
                for (const kb of keybindings) {
                    toDispose.add(this._standaloneKeybindingService.addDynamicKeybinding(uniqueId, kb, run, keybindingsWhen));
                }
            }
            // Finally, register an internal editor action
            let internalAction = new editorAction_1.InternalEditorAction(uniqueId, label, label, precondition, run, this._contextKeyService);
            // Store it under the original id, such that trigger with the original id will work
            this._actions[id] = internalAction;
            toDispose.add((0, lifecycle_1.toDisposable)(() => {
                delete this._actions[id];
            }));
            return toDispose;
        }
    };
    StandaloneCodeEditor = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, codeEditorService_1.ICodeEditorService),
        __param(4, commands_1.ICommandService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService)
    ], StandaloneCodeEditor);
    exports.StandaloneCodeEditor = StandaloneCodeEditor;
    let StandaloneEditor = class StandaloneEditor extends StandaloneCodeEditor {
        constructor(domElement, _options, toDispose, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, contextViewService, themeService, notificationService, configurationService, accessibilityService, modelService, modeService) {
            const options = Object.assign({}, _options);
            (0, simpleServices_1.updateConfigurationService)(configurationService, options, false);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            let _model = options.model;
            delete options.model;
            super(domElement, options, instantiationService, codeEditorService, commandService, contextKeyService, keybindingService, themeService, notificationService, accessibilityService);
            this._contextViewService = contextViewService;
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(toDispose);
            this._register(themeDomRegistration);
            let model;
            if (typeof _model === 'undefined') {
                model = createTextModel(modelService, modeService, options.value || '', options.language || 'text/plain', undefined);
                this._ownsModel = true;
            }
            else {
                model = _model;
                this._ownsModel = false;
            }
            this._attachModel(model);
            if (model) {
                let e = {
                    oldModelUrl: null,
                    newModelUrl: model.uri
                };
                this._onDidChangeModel.fire(e);
            }
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, simpleServices_1.updateConfigurationService)(this._configurationService, newOptions, false);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _attachModel(model) {
            super._attachModel(model);
            if (this._modelData) {
                this._contextViewService.setContainer(this._modelData.view.domNode.domNode);
            }
        }
        _postDetachModelCleanup(detachedModel) {
            super._postDetachModelCleanup(detachedModel);
            if (detachedModel && this._ownsModel) {
                detachedModel.dispose();
                this._ownsModel = false;
            }
        }
    };
    StandaloneEditor = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, commands_1.ICommandService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, contextView_1.IContextViewService),
        __param(9, standaloneThemeService_1.IStandaloneThemeService),
        __param(10, notification_1.INotificationService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, accessibility_1.IAccessibilityService),
        __param(13, modelService_1.IModelService),
        __param(14, modeService_1.IModeService)
    ], StandaloneEditor);
    exports.StandaloneEditor = StandaloneEditor;
    let StandaloneDiffEditor = class StandaloneDiffEditor extends diffEditorWidget_1.DiffEditorWidget {
        constructor(domElement, _options, toDispose, instantiationService, contextKeyService, keybindingService, contextViewService, editorWorkerService, codeEditorService, themeService, notificationService, configurationService, contextMenuService, editorProgressService, clipboardService) {
            const options = Object.assign({}, _options);
            (0, simpleServices_1.updateConfigurationService)(configurationService, options, true);
            const themeDomRegistration = themeService.registerEditorContainer(domElement);
            if (typeof options.theme === 'string') {
                themeService.setTheme(options.theme);
            }
            if (typeof options.autoDetectHighContrast !== 'undefined') {
                themeService.setAutoDetectHighContrast(Boolean(options.autoDetectHighContrast));
            }
            super(domElement, options, {}, clipboardService, editorWorkerService, contextKeyService, instantiationService, codeEditorService, themeService, notificationService, contextMenuService, editorProgressService);
            this._contextViewService = contextViewService;
            this._configurationService = configurationService;
            this._standaloneThemeService = themeService;
            this._register(toDispose);
            this._register(themeDomRegistration);
            this._contextViewService.setContainer(this._containerDomElement);
        }
        dispose() {
            super.dispose();
        }
        updateOptions(newOptions) {
            (0, simpleServices_1.updateConfigurationService)(this._configurationService, newOptions, true);
            if (typeof newOptions.theme === 'string') {
                this._standaloneThemeService.setTheme(newOptions.theme);
            }
            if (typeof newOptions.autoDetectHighContrast !== 'undefined') {
                this._standaloneThemeService.setAutoDetectHighContrast(Boolean(newOptions.autoDetectHighContrast));
            }
            super.updateOptions(newOptions);
        }
        _createInnerEditor(instantiationService, container, options) {
            return instantiationService.createInstance(StandaloneCodeEditor, container, options);
        }
        getOriginalEditor() {
            return super.getOriginalEditor();
        }
        getModifiedEditor() {
            return super.getModifiedEditor();
        }
        addCommand(keybinding, handler, context) {
            return this.getModifiedEditor().addCommand(keybinding, handler, context);
        }
        createContextKey(key, defaultValue) {
            return this.getModifiedEditor().createContextKey(key, defaultValue);
        }
        addAction(descriptor) {
            return this.getModifiedEditor().addAction(descriptor);
        }
    };
    StandaloneDiffEditor = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, contextView_1.IContextViewService),
        __param(7, editorWorkerService_1.IEditorWorkerService),
        __param(8, codeEditorService_1.ICodeEditorService),
        __param(9, standaloneThemeService_1.IStandaloneThemeService),
        __param(10, notification_1.INotificationService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, progress_1.IEditorProgressService),
        __param(14, clipboardService_1.IClipboardService)
    ], StandaloneDiffEditor);
    exports.StandaloneDiffEditor = StandaloneDiffEditor;
    /**
     * @internal
     */
    function createTextModel(modelService, modeService, value, language, uri) {
        value = value || '';
        if (!language) {
            const firstLF = value.indexOf('\n');
            let firstLine = value;
            if (firstLF !== -1) {
                firstLine = value.substring(0, firstLF);
            }
            return doCreateModel(modelService, value, modeService.createByFilepathOrFirstLine(uri || null, firstLine), uri);
        }
        return doCreateModel(modelService, value, modeService.create(language), uri);
    }
    exports.createTextModel = createTextModel;
    /**
     * @internal
     */
    function doCreateModel(modelService, value, languageSelection, uri) {
        return modelService.createModel(value, languageSelection, uri);
    }
});
//# sourceMappingURL=standaloneCodeEditor.js.map