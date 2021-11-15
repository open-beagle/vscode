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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorStatus", "vs/base/browser/dom", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/actions", "vs/base/common/platform", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor", "vs/base/common/lifecycle", "vs/editor/contrib/linesOperations/linesOperations", "vs/editor/contrib/indentation/indentation", "vs/workbench/browser/parts/editor/binaryEditor", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/modeService", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/config/commonEditorConfig", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/textfile/common/encoding", "vs/editor/common/services/textResourceConfigurationService", "vs/platform/configuration/common/configuration", "vs/base/common/objects", "vs/editor/browser/editorBrowser", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/base/common/async", "vs/platform/notification/common/notification", "vs/base/common/event", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/statusbar/common/statusbar", "vs/platform/markers/common/markers", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/css!./media/editorstatus"], function (require, exports, nls_1, dom_1, strings_1, resources_1, types_1, uri_1, actions_1, platform_1, untitledTextEditorInput_1, editor_1, lifecycle_1, linesOperations_1, indentation_1, binaryEditor_1, binaryDiffEditor_1, editorService_1, files_1, instantiation_1, modeService_1, range_1, selection_1, commonEditorConfig_1, commands_1, extensionManagement_1, textfiles_1, encoding_1, textResourceConfigurationService_1, configuration_1, objects_1, editorBrowser_1, network_1, preferences_1, quickInput_1, getIconClasses_1, async_1, notification_1, event_1, accessibility_1, statusbar_1, markers_1, theme_1, themeService_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChangeEncodingAction = exports.ChangeEOLAction = exports.ChangeModeAction = exports.ShowLanguageExtensionsAction = exports.EditorStatus = void 0;
    class SideBySideEditorEncodingSupport {
        constructor(primary, secondary) {
            this.primary = primary;
            this.secondary = secondary;
        }
        getEncoding() {
            return this.primary.getEncoding(); // always report from modified (right hand) side
        }
        async setEncoding(encoding, mode) {
            await async_1.Promises.settled([this.primary, this.secondary].map(editor => editor.setEncoding(encoding, mode)));
        }
    }
    class SideBySideEditorModeSupport {
        constructor(primary, secondary) {
            this.primary = primary;
            this.secondary = secondary;
        }
        setMode(mode) {
            [this.primary, this.secondary].forEach(editor => editor.setMode(mode));
        }
    }
    function toEditorWithEncodingSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof editor_1.SideBySideEditorInput) {
            const primaryEncodingSupport = toEditorWithEncodingSupport(input.primary);
            const secondaryEncodingSupport = toEditorWithEncodingSupport(input.secondary);
            if (primaryEncodingSupport && secondaryEncodingSupport) {
                return new SideBySideEditorEncodingSupport(primaryEncodingSupport, secondaryEncodingSupport);
            }
            return primaryEncodingSupport;
        }
        // File or Resource Editor
        const encodingSupport = input;
        if ((0, types_1.areFunctions)(encodingSupport.setEncoding, encodingSupport.getEncoding)) {
            return encodingSupport;
        }
        // Unsupported for any other editor
        return null;
    }
    function toEditorWithModeSupport(input) {
        // Untitled Text Editor
        if (input instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
            return input;
        }
        // Side by Side (diff) Editor
        if (input instanceof editor_1.SideBySideEditorInput) {
            const primaryModeSupport = toEditorWithModeSupport(input.primary);
            const secondaryModeSupport = toEditorWithModeSupport(input.secondary);
            if (primaryModeSupport && secondaryModeSupport) {
                return new SideBySideEditorModeSupport(primaryModeSupport, secondaryModeSupport);
            }
            return primaryModeSupport;
        }
        // File or Resource Editor
        const modeSupport = input;
        if (typeof modeSupport.setMode === 'function') {
            return modeSupport;
        }
        // Unsupported for any other editor
        return null;
    }
    class StateChange {
        constructor() {
            this.indentation = false;
            this.selectionStatus = false;
            this.mode = false;
            this.encoding = false;
            this.EOL = false;
            this.tabFocusMode = false;
            this.columnSelectionMode = false;
            this.screenReaderMode = false;
            this.metadata = false;
        }
        combine(other) {
            this.indentation = this.indentation || other.indentation;
            this.selectionStatus = this.selectionStatus || other.selectionStatus;
            this.mode = this.mode || other.mode;
            this.encoding = this.encoding || other.encoding;
            this.EOL = this.EOL || other.EOL;
            this.tabFocusMode = this.tabFocusMode || other.tabFocusMode;
            this.columnSelectionMode = this.columnSelectionMode || other.columnSelectionMode;
            this.screenReaderMode = this.screenReaderMode || other.screenReaderMode;
            this.metadata = this.metadata || other.metadata;
        }
        hasChanges() {
            return this.indentation
                || this.selectionStatus
                || this.mode
                || this.encoding
                || this.EOL
                || this.tabFocusMode
                || this.columnSelectionMode
                || this.screenReaderMode
                || this.metadata;
        }
    }
    class State {
        get selectionStatus() { return this._selectionStatus; }
        get mode() { return this._mode; }
        get encoding() { return this._encoding; }
        get EOL() { return this._EOL; }
        get indentation() { return this._indentation; }
        get tabFocusMode() { return this._tabFocusMode; }
        get columnSelectionMode() { return this._columnSelectionMode; }
        get screenReaderMode() { return this._screenReaderMode; }
        get metadata() { return this._metadata; }
        update(update) {
            const change = new StateChange();
            if (update.type === 'selectionStatus') {
                if (this._selectionStatus !== update.selectionStatus) {
                    this._selectionStatus = update.selectionStatus;
                    change.selectionStatus = true;
                }
            }
            if (update.type === 'indentation') {
                if (this._indentation !== update.indentation) {
                    this._indentation = update.indentation;
                    change.indentation = true;
                }
            }
            if (update.type === 'mode') {
                if (this._mode !== update.mode) {
                    this._mode = update.mode;
                    change.mode = true;
                }
            }
            if (update.type === 'encoding') {
                if (this._encoding !== update.encoding) {
                    this._encoding = update.encoding;
                    change.encoding = true;
                }
            }
            if (update.type === 'EOL') {
                if (this._EOL !== update.EOL) {
                    this._EOL = update.EOL;
                    change.EOL = true;
                }
            }
            if (update.type === 'tabFocusMode') {
                if (this._tabFocusMode !== update.tabFocusMode) {
                    this._tabFocusMode = update.tabFocusMode;
                    change.tabFocusMode = true;
                }
            }
            if (update.type === 'columnSelectionMode') {
                if (this._columnSelectionMode !== update.columnSelectionMode) {
                    this._columnSelectionMode = update.columnSelectionMode;
                    change.columnSelectionMode = true;
                }
            }
            if (update.type === 'screenReaderMode') {
                if (this._screenReaderMode !== update.screenReaderMode) {
                    this._screenReaderMode = update.screenReaderMode;
                    change.screenReaderMode = true;
                }
            }
            if (update.type === 'metadata') {
                if (this._metadata !== update.metadata) {
                    this._metadata = update.metadata;
                    change.metadata = true;
                }
            }
            return change;
        }
    }
    const nlsSingleSelectionRange = (0, nls_1.localize)(0, null);
    const nlsSingleSelection = (0, nls_1.localize)(1, null);
    const nlsMultiSelectionRange = (0, nls_1.localize)(2, null);
    const nlsMultiSelection = (0, nls_1.localize)(3, null);
    const nlsEOLLF = (0, nls_1.localize)(4, null);
    const nlsEOLCRLF = (0, nls_1.localize)(5, null);
    let EditorStatus = class EditorStatus extends lifecycle_1.Disposable {
        constructor(editorService, quickInputService, modeService, textFileService, configurationService, notificationService, accessibilityService, statusbarService, instantiationService) {
            super();
            this.editorService = editorService;
            this.quickInputService = quickInputService;
            this.modeService = modeService;
            this.textFileService = textFileService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.accessibilityService = accessibilityService;
            this.statusbarService = statusbarService;
            this.instantiationService = instantiationService;
            this.tabFocusModeElement = this._register(new lifecycle_1.MutableDisposable());
            this.columnSelectionModeElement = this._register(new lifecycle_1.MutableDisposable());
            this.screenRedearModeElement = this._register(new lifecycle_1.MutableDisposable());
            this.indentationElement = this._register(new lifecycle_1.MutableDisposable());
            this.selectionElement = this._register(new lifecycle_1.MutableDisposable());
            this.encodingElement = this._register(new lifecycle_1.MutableDisposable());
            this.eolElement = this._register(new lifecycle_1.MutableDisposable());
            this.modeElement = this._register(new lifecycle_1.MutableDisposable());
            this.metadataElement = this._register(new lifecycle_1.MutableDisposable());
            this.currentProblemStatus = this._register(this.instantiationService.createInstance(ShowCurrentMarkerInStatusbarContribution));
            this.state = new State();
            this.activeEditorListeners = this._register(new lifecycle_1.DisposableStore());
            this.delayedRender = this._register(new lifecycle_1.MutableDisposable());
            this.toRender = null;
            this.screenReaderNotification = null;
            this.promptedScreenReader = false;
            this.registerCommands();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateStatusBar()));
            this._register(this.textFileService.untitled.onDidChangeEncoding(model => this.onResourceEncodingChange(model.resource)));
            this._register(this.textFileService.files.onDidChangeEncoding(model => this.onResourceEncodingChange((model.resource))));
            this._register(commonEditorConfig_1.TabFocus.onDidChangeTabFocus(e => this.onTabFocusModeChange()));
        }
        registerCommands() {
            commands_1.CommandsRegistry.registerCommand({ id: 'showEditorScreenReaderNotification', handler: () => this.showScreenReaderNotification() });
            commands_1.CommandsRegistry.registerCommand({ id: 'changeEditorIndentation', handler: () => this.showIndentationPicker() });
        }
        showScreenReaderNotification() {
            if (!this.screenReaderNotification) {
                this.screenReaderNotification = this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(6, null), [{
                        label: (0, nls_1.localize)(7, null),
                        run: () => {
                            this.configurationService.updateValue('editor.accessibilitySupport', 'on');
                        }
                    }, {
                        label: (0, nls_1.localize)(8, null),
                        run: () => {
                            this.configurationService.updateValue('editor.accessibilitySupport', 'off');
                        }
                    }], { sticky: true });
                event_1.Event.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
            }
        }
        async showIndentationPicker() {
            var _a;
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                return this.quickInputService.pick([{ label: (0, nls_1.localize)(9, null) }]);
            }
            if ((_a = this.editorService.activeEditor) === null || _a === void 0 ? void 0 : _a.isReadonly()) {
                return this.quickInputService.pick([{ label: (0, nls_1.localize)(10, null) }]);
            }
            const picks = [
                activeTextEditorControl.getAction(indentation_1.IndentUsingSpaces.ID),
                activeTextEditorControl.getAction(indentation_1.IndentUsingTabs.ID),
                activeTextEditorControl.getAction(indentation_1.DetectIndentation.ID),
                activeTextEditorControl.getAction(indentation_1.IndentationToSpacesAction.ID),
                activeTextEditorControl.getAction(indentation_1.IndentationToTabsAction.ID),
                activeTextEditorControl.getAction(linesOperations_1.TrimTrailingWhitespaceAction.ID)
            ].map((a) => {
                return {
                    id: a.id,
                    label: a.label,
                    detail: (platform_1.Language.isDefaultVariant() || a.label === a.alias) ? undefined : a.alias,
                    run: () => {
                        activeTextEditorControl.focus();
                        a.run();
                    }
                };
            });
            picks.splice(3, 0, { type: 'separator', label: (0, nls_1.localize)(11, null) });
            picks.unshift({ type: 'separator', label: (0, nls_1.localize)(12, null) });
            const action = await this.quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(13, null), matchOnDetail: true });
            return action === null || action === void 0 ? void 0 : action.run();
        }
        updateTabFocusModeElement(visible) {
            if (visible) {
                if (!this.tabFocusModeElement.value) {
                    const text = (0, nls_1.localize)(14, null);
                    this.tabFocusModeElement.value = this.statusbarService.addEntry({
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)(15, null),
                        command: 'editor.action.toggleTabFocusMode',
                        backgroundColor: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                        color: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                    }, 'status.editor.tabFocusMode', (0, nls_1.localize)(16, null), 1 /* RIGHT */, 100.7);
                }
            }
            else {
                this.tabFocusModeElement.clear();
            }
        }
        updateColumnSelectionModeElement(visible) {
            if (visible) {
                if (!this.columnSelectionModeElement.value) {
                    const text = (0, nls_1.localize)(17, null);
                    this.columnSelectionModeElement.value = this.statusbarService.addEntry({
                        text,
                        ariaLabel: text,
                        tooltip: (0, nls_1.localize)(18, null),
                        command: 'editor.action.toggleColumnSelection',
                        backgroundColor: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                        color: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                    }, 'status.editor.columnSelectionMode', (0, nls_1.localize)(19, null), 1 /* RIGHT */, 100.8);
                }
            }
            else {
                this.columnSelectionModeElement.clear();
            }
        }
        updateScreenReaderModeElement(visible) {
            if (visible) {
                if (!this.screenRedearModeElement.value) {
                    const text = (0, nls_1.localize)(20, null);
                    this.screenRedearModeElement.value = this.statusbarService.addEntry({
                        text,
                        ariaLabel: text,
                        command: 'showEditorScreenReaderNotification',
                        backgroundColor: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_BACKGROUND),
                        color: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_PROMINENT_ITEM_FOREGROUND)
                    }, 'status.editor.screenReaderMode', (0, nls_1.localize)(21, null), 1 /* RIGHT */, 100.6);
                }
            }
            else {
                this.screenRedearModeElement.clear();
            }
        }
        updateSelectionElement(text) {
            if (!text) {
                this.selectionElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(22, null),
                command: 'workbench.action.gotoLine'
            };
            this.updateElement(this.selectionElement, props, 'status.editor.selection', (0, nls_1.localize)(23, null), 1 /* RIGHT */, 100.5);
        }
        updateIndentationElement(text) {
            if (!text) {
                this.indentationElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(24, null),
                command: 'changeEditorIndentation'
            };
            this.updateElement(this.indentationElement, props, 'status.editor.indentation', (0, nls_1.localize)(25, null), 1 /* RIGHT */, 100.4);
        }
        updateEncodingElement(text) {
            if (!text) {
                this.encodingElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(26, null),
                command: 'workbench.action.editor.changeEncoding'
            };
            this.updateElement(this.encodingElement, props, 'status.editor.encoding', (0, nls_1.localize)(27, null), 1 /* RIGHT */, 100.3);
        }
        updateEOLElement(text) {
            if (!text) {
                this.eolElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(28, null),
                command: 'workbench.action.editor.changeEOL'
            };
            this.updateElement(this.eolElement, props, 'status.editor.eol', (0, nls_1.localize)(29, null), 1 /* RIGHT */, 100.2);
        }
        updateModeElement(text) {
            if (!text) {
                this.modeElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(30, null),
                command: 'workbench.action.editor.changeLanguageMode'
            };
            this.updateElement(this.modeElement, props, 'status.editor.mode', (0, nls_1.localize)(31, null), 1 /* RIGHT */, 100.1);
        }
        updateMetadataElement(text) {
            if (!text) {
                this.metadataElement.clear();
                return;
            }
            const props = {
                text,
                ariaLabel: text,
                tooltip: (0, nls_1.localize)(32, null)
            };
            this.updateElement(this.metadataElement, props, 'status.editor.info', (0, nls_1.localize)(33, null), 1 /* RIGHT */, 100);
        }
        updateElement(element, props, id, name, alignment, priority) {
            if (!element.value) {
                element.value = this.statusbarService.addEntry(props, id, name, alignment, priority);
            }
            else {
                element.value.update(props);
            }
        }
        updateState(update) {
            const changed = this.state.update(update);
            if (!changed.hasChanges()) {
                return; // Nothing really changed
            }
            if (!this.toRender) {
                this.toRender = changed;
                this.delayedRender.value = (0, dom_1.runAtThisOrScheduleAtNextAnimationFrame)(() => {
                    this.delayedRender.clear();
                    const toRender = this.toRender;
                    this.toRender = null;
                    if (toRender) {
                        this.doRenderNow(toRender);
                    }
                });
            }
            else {
                this.toRender.combine(changed);
            }
        }
        doRenderNow(changed) {
            this.updateTabFocusModeElement(!!this.state.tabFocusMode);
            this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode);
            this.updateScreenReaderModeElement(!!this.state.screenReaderMode);
            this.updateIndentationElement(this.state.indentation);
            this.updateSelectionElement(this.state.selectionStatus);
            this.updateEncodingElement(this.state.encoding);
            this.updateEOLElement(this.state.EOL ? this.state.EOL === '\r\n' ? nlsEOLCRLF : nlsEOLLF : undefined);
            this.updateModeElement(this.state.mode);
            this.updateMetadataElement(this.state.metadata);
        }
        getSelectionLabel(info) {
            if (!info || !info.selections) {
                return undefined;
            }
            if (info.selections.length === 1) {
                if (info.charactersSelected) {
                    return (0, strings_1.format)(nlsSingleSelectionRange, info.selections[0].positionLineNumber, info.selections[0].positionColumn, info.charactersSelected);
                }
                return (0, strings_1.format)(nlsSingleSelection, info.selections[0].positionLineNumber, info.selections[0].positionColumn);
            }
            if (info.charactersSelected) {
                return (0, strings_1.format)(nlsMultiSelectionRange, info.selections.length, info.charactersSelected);
            }
            if (info.selections.length > 0) {
                return (0, strings_1.format)(nlsMultiSelection, info.selections.length);
            }
            return undefined;
        }
        updateStatusBar() {
            const activeInput = this.editorService.activeEditor;
            const activeEditorPane = this.editorService.activeEditorPane;
            const activeCodeEditor = activeEditorPane ? (0, types_1.withNullAsUndefined)((0, editorBrowser_1.getCodeEditor)(activeEditorPane.getControl())) : undefined;
            // Update all states
            this.onColumnSelectionModeChange(activeCodeEditor);
            this.onScreenReaderModeChange(activeCodeEditor);
            this.onSelectionChange(activeCodeEditor);
            this.onModeChange(activeCodeEditor, activeInput);
            this.onEOLChange(activeCodeEditor);
            this.onEncodingChange(activeEditorPane, activeCodeEditor);
            this.onIndentationChange(activeCodeEditor);
            this.onMetadataChange(activeEditorPane);
            this.currentProblemStatus.update(activeCodeEditor);
            // Dispose old active editor listeners
            this.activeEditorListeners.clear();
            // Attach new listeners to active editor
            if (activeCodeEditor) {
                // Hook Listener for Configuration changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeConfiguration((event) => {
                    if (event.hasChanged(16 /* columnSelection */)) {
                        this.onColumnSelectionModeChange(activeCodeEditor);
                    }
                    if (event.hasChanged(2 /* accessibilitySupport */)) {
                        this.onScreenReaderModeChange(activeCodeEditor);
                    }
                }));
                // Hook Listener for Selection changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeCursorPosition((event) => {
                    this.onSelectionChange(activeCodeEditor);
                    this.currentProblemStatus.update(activeCodeEditor);
                }));
                // Hook Listener for mode changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelLanguage((event) => {
                    this.onModeChange(activeCodeEditor, activeInput);
                }));
                // Hook Listener for content changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelContent((e) => {
                    this.onEOLChange(activeCodeEditor);
                    this.currentProblemStatus.update(activeCodeEditor);
                    const selections = activeCodeEditor.getSelections();
                    if (selections) {
                        for (const change of e.changes) {
                            if (selections.some(selection => range_1.Range.areIntersecting(selection, change.range))) {
                                this.onSelectionChange(activeCodeEditor);
                                break;
                            }
                        }
                    }
                }));
                // Hook Listener for content options changes
                this.activeEditorListeners.add(activeCodeEditor.onDidChangeModelOptions((event) => {
                    this.onIndentationChange(activeCodeEditor);
                }));
            }
            // Handle binary editors
            else if (activeEditorPane instanceof binaryEditor_1.BaseBinaryResourceEditor || activeEditorPane instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                const binaryEditors = [];
                if (activeEditorPane instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                    const primary = activeEditorPane.getPrimaryEditorPane();
                    if (primary instanceof binaryEditor_1.BaseBinaryResourceEditor) {
                        binaryEditors.push(primary);
                    }
                    const secondary = activeEditorPane.getSecondaryEditorPane();
                    if (secondary instanceof binaryEditor_1.BaseBinaryResourceEditor) {
                        binaryEditors.push(secondary);
                    }
                }
                else {
                    binaryEditors.push(activeEditorPane);
                }
                binaryEditors.forEach(editor => {
                    this.activeEditorListeners.add(editor.onDidChangeMetadata(metadata => {
                        this.onMetadataChange(activeEditorPane);
                    }));
                    this.activeEditorListeners.add(editor.onDidOpenInPlace(() => {
                        this.updateStatusBar();
                    }));
                });
            }
        }
        onModeChange(editorWidget, editorInput) {
            let info = { type: 'mode', mode: undefined };
            // We only support text based editors
            if (editorWidget && editorInput && toEditorWithModeSupport(editorInput)) {
                const textModel = editorWidget.getModel();
                if (textModel) {
                    const modeId = textModel.getLanguageIdentifier().language;
                    info.mode = (0, types_1.withNullAsUndefined)(this.modeService.getLanguageName(modeId));
                }
            }
            this.updateState(info);
        }
        onIndentationChange(editorWidget) {
            const update = { type: 'indentation', indentation: undefined };
            if (editorWidget) {
                const model = editorWidget.getModel();
                if (model) {
                    const modelOpts = model.getOptions();
                    update.indentation = (modelOpts.insertSpaces
                        ? (0, nls_1.localize)(34, null, modelOpts.indentSize)
                        : (0, nls_1.localize)(35, null, modelOpts.tabSize));
                }
            }
            this.updateState(update);
        }
        onMetadataChange(editor) {
            const update = { type: 'metadata', metadata: undefined };
            if (editor instanceof binaryEditor_1.BaseBinaryResourceEditor || editor instanceof binaryDiffEditor_1.BinaryResourceDiffEditor) {
                update.metadata = editor.getMetadata();
            }
            this.updateState(update);
        }
        onColumnSelectionModeChange(editorWidget) {
            const info = { type: 'columnSelectionMode', columnSelectionMode: false };
            if (editorWidget === null || editorWidget === void 0 ? void 0 : editorWidget.getOption(16 /* columnSelection */)) {
                info.columnSelectionMode = true;
            }
            this.updateState(info);
        }
        onScreenReaderModeChange(editorWidget) {
            var _a;
            let screenReaderMode = false;
            // We only support text based editors
            if (editorWidget) {
                const screenReaderDetected = this.accessibilityService.isScreenReaderOptimized();
                if (screenReaderDetected) {
                    const screenReaderConfiguration = (_a = this.configurationService.getValue('editor')) === null || _a === void 0 ? void 0 : _a.accessibilitySupport;
                    if (screenReaderConfiguration === 'auto') {
                        if (!this.promptedScreenReader) {
                            this.promptedScreenReader = true;
                            setTimeout(() => this.showScreenReaderNotification(), 100);
                        }
                    }
                }
                screenReaderMode = (editorWidget.getOption(2 /* accessibilitySupport */) === 2 /* Enabled */);
            }
            if (screenReaderMode === false && this.screenReaderNotification) {
                this.screenReaderNotification.close();
            }
            this.updateState({ type: 'screenReaderMode', screenReaderMode: screenReaderMode });
        }
        onSelectionChange(editorWidget) {
            const info = Object.create(null);
            // We only support text based editors
            if (editorWidget) {
                // Compute selection(s)
                info.selections = editorWidget.getSelections() || [];
                // Compute selection length
                info.charactersSelected = 0;
                const textModel = editorWidget.getModel();
                if (textModel) {
                    info.selections.forEach(selection => {
                        if (typeof info.charactersSelected !== 'number') {
                            info.charactersSelected = 0;
                        }
                        info.charactersSelected += textModel.getCharacterCountInRange(selection);
                    });
                }
                // Compute the visible column for one selection. This will properly handle tabs and their configured widths
                if (info.selections.length === 1) {
                    const editorPosition = editorWidget.getPosition();
                    let selectionClone = new selection_1.Selection(info.selections[0].selectionStartLineNumber, info.selections[0].selectionStartColumn, info.selections[0].positionLineNumber, editorPosition ? editorWidget.getStatusbarColumn(editorPosition) : info.selections[0].positionColumn);
                    info.selections[0] = selectionClone;
                }
            }
            this.updateState({ type: 'selectionStatus', selectionStatus: this.getSelectionLabel(info) });
        }
        onEOLChange(editorWidget) {
            const info = { type: 'EOL', EOL: undefined };
            if (editorWidget && !editorWidget.getOption(77 /* readOnly */)) {
                const codeEditorModel = editorWidget.getModel();
                if (codeEditorModel) {
                    info.EOL = codeEditorModel.getEOL();
                }
            }
            this.updateState(info);
        }
        onEncodingChange(editor, editorWidget) {
            if (editor && !this.isActiveEditor(editor)) {
                return;
            }
            const info = { type: 'encoding', encoding: undefined };
            // We only support text based editors that have a model associated
            // This ensures we do not show the encoding picker while an editor
            // is still loading.
            if (editor && (editorWidget === null || editorWidget === void 0 ? void 0 : editorWidget.hasModel())) {
                const encodingSupport = editor.input ? toEditorWithEncodingSupport(editor.input) : null;
                if (encodingSupport) {
                    const rawEncoding = encodingSupport.getEncoding();
                    const encodingInfo = typeof rawEncoding === 'string' ? encoding_1.SUPPORTED_ENCODINGS[rawEncoding] : undefined;
                    if (encodingInfo) {
                        info.encoding = encodingInfo.labelShort; // if we have a label, take it from there
                    }
                    else {
                        info.encoding = rawEncoding; // otherwise use it raw
                    }
                }
            }
            this.updateState(info);
        }
        onResourceEncodingChange(resource) {
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditorPane) {
                const activeResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                if (activeResource && (0, resources_1.isEqual)(activeResource, resource)) {
                    const activeCodeEditor = (0, types_1.withNullAsUndefined)((0, editorBrowser_1.getCodeEditor)(activeEditorPane.getControl()));
                    return this.onEncodingChange(activeEditorPane, activeCodeEditor); // only update if the encoding changed for the active resource
                }
            }
        }
        onTabFocusModeChange() {
            const info = { type: 'tabFocusMode', tabFocusMode: commonEditorConfig_1.TabFocus.getTabFocusMode() };
            this.updateState(info);
        }
        isActiveEditor(control) {
            const activeEditorPane = this.editorService.activeEditorPane;
            return !!activeEditorPane && activeEditorPane === control;
        }
    };
    EditorStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, modeService_1.IModeService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, notification_1.INotificationService),
        __param(6, accessibility_1.IAccessibilityService),
        __param(7, statusbar_1.IStatusbarService),
        __param(8, instantiation_1.IInstantiationService)
    ], EditorStatus);
    exports.EditorStatus = EditorStatus;
    let ShowCurrentMarkerInStatusbarContribution = class ShowCurrentMarkerInStatusbarContribution extends lifecycle_1.Disposable {
        constructor(statusbarService, markerService, configurationService) {
            super();
            this.statusbarService = statusbarService;
            this.markerService = markerService;
            this.configurationService = configurationService;
            this.editor = undefined;
            this.markers = [];
            this.currentMarker = null;
            this.statusBarEntryAccessor = this._register(new lifecycle_1.MutableDisposable());
            this._register(markerService.onMarkerChanged(changedResources => this.onMarkerChanged(changedResources)));
            this._register(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('problems.showCurrentInStatus'))(() => this.updateStatus()));
        }
        update(editor) {
            this.editor = editor;
            this.updateMarkers();
            this.updateStatus();
        }
        updateStatus() {
            const previousMarker = this.currentMarker;
            this.currentMarker = this.getMarker();
            if (this.hasToUpdateStatus(previousMarker, this.currentMarker)) {
                if (this.currentMarker) {
                    const line = (0, strings_1.splitLines)(this.currentMarker.message)[0];
                    const text = `${this.getType(this.currentMarker)} ${line}`;
                    if (!this.statusBarEntryAccessor.value) {
                        this.statusBarEntryAccessor.value = this.statusbarService.addEntry({ text: '', ariaLabel: '' }, 'statusbar.currentProblem', (0, nls_1.localize)(36, null), 0 /* LEFT */);
                    }
                    this.statusBarEntryAccessor.value.update({ text, ariaLabel: text });
                }
                else {
                    this.statusBarEntryAccessor.clear();
                }
            }
        }
        hasToUpdateStatus(previousMarker, currentMarker) {
            if (!currentMarker) {
                return true;
            }
            if (!previousMarker) {
                return true;
            }
            return markers_1.IMarkerData.makeKey(previousMarker) !== markers_1.IMarkerData.makeKey(currentMarker);
        }
        getType(marker) {
            switch (marker.severity) {
                case markers_1.MarkerSeverity.Error: return '$(error)';
                case markers_1.MarkerSeverity.Warning: return '$(warning)';
                case markers_1.MarkerSeverity.Info: return '$(info)';
            }
            return '';
        }
        getMarker() {
            if (!this.configurationService.getValue('problems.showCurrentInStatus')) {
                return null;
            }
            if (!this.editor) {
                return null;
            }
            const model = this.editor.getModel();
            if (!model) {
                return null;
            }
            const position = this.editor.getPosition();
            if (!position) {
                return null;
            }
            return this.markers.find(marker => range_1.Range.containsPosition(marker, position)) || null;
        }
        onMarkerChanged(changedResources) {
            if (!this.editor) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (model && !changedResources.some(r => (0, resources_1.isEqual)(model.uri, r))) {
                return;
            }
            this.updateMarkers();
        }
        updateMarkers() {
            if (!this.editor) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (model) {
                this.markers = this.markerService.read({
                    resource: model.uri,
                    severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning | markers_1.MarkerSeverity.Info
                });
                this.markers.sort(compareMarker);
            }
            else {
                this.markers = [];
            }
            this.updateStatus();
        }
    };
    ShowCurrentMarkerInStatusbarContribution = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, markers_1.IMarkerService),
        __param(2, configuration_1.IConfigurationService)
    ], ShowCurrentMarkerInStatusbarContribution);
    function compareMarker(a, b) {
        let res = (0, strings_1.compare)(a.resource.toString(), b.resource.toString());
        if (res === 0) {
            res = markers_1.MarkerSeverity.compare(a.severity, b.severity);
        }
        if (res === 0) {
            res = range_1.Range.compareRangesUsingStarts(a, b);
        }
        return res;
    }
    let ShowLanguageExtensionsAction = class ShowLanguageExtensionsAction extends actions_1.Action {
        constructor(fileExtension, commandService, galleryService) {
            super(ShowLanguageExtensionsAction.ID, (0, nls_1.localize)(37, null, fileExtension));
            this.fileExtension = fileExtension;
            this.commandService = commandService;
            this.enabled = galleryService.isEnabled();
        }
        async run() {
            await this.commandService.executeCommand('workbench.extensions.action.showExtensionsForLanguage', this.fileExtension);
        }
    };
    ShowLanguageExtensionsAction.ID = 'workbench.action.showLanguageExtensions';
    ShowLanguageExtensionsAction = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, extensionManagement_1.IExtensionGalleryService)
    ], ShowLanguageExtensionsAction);
    exports.ShowLanguageExtensionsAction = ShowLanguageExtensionsAction;
    let ChangeModeAction = class ChangeModeAction extends actions_1.Action {
        constructor(actionId, actionLabel, modeService, editorService, configurationService, quickInputService, preferencesService, instantiationService, textFileService, telemetryService) {
            super(actionId, actionLabel);
            this.modeService = modeService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.preferencesService = preferencesService;
            this.instantiationService = instantiationService;
            this.textFileService = textFileService;
            this.telemetryService = telemetryService;
        }
        async run(event, data) {
            var _a;
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(39, null) }]);
                return;
            }
            const textModel = activeTextEditorControl.getModel();
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            let hasLanguageSupport = !!resource;
            if ((resource === null || resource === void 0 ? void 0 : resource.scheme) === network_1.Schemas.untitled && !((_a = this.textFileService.untitled.get(resource)) === null || _a === void 0 ? void 0 : _a.hasAssociatedFilePath)) {
                hasLanguageSupport = false; // no configuration for untitled resources (e.g. "Untitled-1")
            }
            // Compute mode
            let currentLanguageId;
            let currentModeId;
            if (textModel) {
                currentModeId = textModel.getLanguageIdentifier().language;
                currentLanguageId = (0, types_1.withNullAsUndefined)(this.modeService.getLanguageName(currentModeId));
            }
            // All languages are valid picks
            const languages = this.modeService.getRegisteredLanguageNames();
            const picks = languages.sort().map(lang => {
                const modeId = this.modeService.getModeIdForLanguageName(lang.toLowerCase()) || 'unknown';
                const extensions = this.modeService.getExtensions(lang).join(' ');
                let description;
                if (currentLanguageId === lang) {
                    description = (0, nls_1.localize)(40, null, modeId);
                }
                else {
                    description = (0, nls_1.localize)(41, null, modeId);
                }
                return {
                    label: lang,
                    meta: extensions,
                    iconClasses: (0, getIconClasses_1.getIconClassesForModeId)(modeId),
                    description
                };
            });
            if (hasLanguageSupport) {
                picks.unshift({ type: 'separator', label: (0, nls_1.localize)(42, null) });
            }
            // Offer action to configure via settings
            let configureModeAssociations;
            let configureModeSettings;
            let galleryAction;
            if (hasLanguageSupport && resource) {
                const ext = (0, resources_1.extname)(resource) || (0, resources_1.basename)(resource);
                galleryAction = this.instantiationService.createInstance(ShowLanguageExtensionsAction, ext);
                if (galleryAction.enabled) {
                    picks.unshift(galleryAction);
                }
                configureModeSettings = { label: (0, nls_1.localize)(43, null, currentLanguageId) };
                picks.unshift(configureModeSettings);
                configureModeAssociations = { label: (0, nls_1.localize)(44, null, ext) };
                picks.unshift(configureModeAssociations);
            }
            // Offer to "Auto Detect"
            const autoDetectMode = {
                label: (0, nls_1.localize)(45, null)
            };
            if (hasLanguageSupport) {
                picks.unshift(autoDetectMode);
            }
            const pick = await this.quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(46, null), matchOnDescription: true });
            if (!pick) {
                return;
            }
            if (pick === galleryAction) {
                galleryAction.run();
                return;
            }
            // User decided to permanently configure associations, return right after
            if (pick === configureModeAssociations) {
                if (resource) {
                    this.configureFileAssociation(resource);
                }
                return;
            }
            // User decided to configure settings for current language
            if (pick === configureModeSettings) {
                this.preferencesService.openGlobalSettings(true, { revealSetting: { key: `[${(0, types_1.withUndefinedAsNull)(currentModeId)}]`, edit: true } });
                return;
            }
            // Change mode for active editor
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor) {
                const modeSupport = toEditorWithModeSupport(activeEditor);
                if (modeSupport) {
                    // Find mode
                    let languageSelection;
                    if (pick === autoDetectMode) {
                        if (textModel) {
                            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                            if (resource) {
                                languageSelection = this.modeService.createByFilepathOrFirstLine(resource, textModel.getLineContent(1));
                            }
                        }
                    }
                    else {
                        languageSelection = this.modeService.createByLanguageName(pick.label);
                    }
                    // Change mode
                    if (typeof languageSelection !== 'undefined') {
                        modeSupport.setMode(languageSelection.languageIdentifier.language);
                    }
                }
                activeTextEditorControl.focus();
                this.telemetryService.publicLog2('workbenchActionExecuted', {
                    id: ChangeModeAction.ID,
                    from: (data === null || data === void 0 ? void 0 : data.from) || 'quick open'
                });
            }
        }
        configureFileAssociation(resource) {
            const extension = (0, resources_1.extname)(resource);
            const base = (0, resources_1.basename)(resource);
            const currentAssociation = this.modeService.getModeIdByFilepathOrFirstLine(uri_1.URI.file(base));
            const languages = this.modeService.getRegisteredLanguageNames();
            const picks = languages.sort().map((lang, index) => {
                const id = (0, types_1.withNullAsUndefined)(this.modeService.getModeIdForLanguageName(lang.toLowerCase())) || 'unknown';
                return {
                    id,
                    label: lang,
                    iconClasses: (0, getIconClasses_1.getIconClassesForModeId)(id),
                    description: (id === currentAssociation) ? (0, nls_1.localize)(47, null) : undefined
                };
            });
            setTimeout(async () => {
                const language = await this.quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(48, null, extension || base) });
                if (language) {
                    const fileAssociationsConfig = this.configurationService.inspect(files_1.FILES_ASSOCIATIONS_CONFIG);
                    let associationKey;
                    if (extension && base[0] !== '.') {
                        associationKey = `*${extension}`; // only use "*.ext" if the file path is in the form of <name>.<ext>
                    }
                    else {
                        associationKey = base; // otherwise use the basename (e.g. .gitignore, Dockerfile)
                    }
                    // If the association is already being made in the workspace, make sure to target workspace settings
                    let target = 1 /* USER */;
                    if (fileAssociationsConfig.workspaceValue && !!fileAssociationsConfig.workspaceValue[associationKey]) {
                        target = 4 /* WORKSPACE */;
                    }
                    // Make sure to write into the value of the target and not the merged value from USER and WORKSPACE config
                    const currentAssociations = (0, objects_1.deepClone)((target === 4 /* WORKSPACE */) ? fileAssociationsConfig.workspaceValue : fileAssociationsConfig.userValue) || Object.create(null);
                    currentAssociations[associationKey] = language.id;
                    this.configurationService.updateValue(files_1.FILES_ASSOCIATIONS_CONFIG, currentAssociations, target);
                }
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    };
    ChangeModeAction.ID = 'workbench.action.editor.changeLanguageMode';
    ChangeModeAction.LABEL = (0, nls_1.localize)(38, null);
    ChangeModeAction = __decorate([
        __param(2, modeService_1.IModeService),
        __param(3, editorService_1.IEditorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, preferences_1.IPreferencesService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, textfiles_1.ITextFileService),
        __param(9, telemetry_1.ITelemetryService)
    ], ChangeModeAction);
    exports.ChangeModeAction = ChangeModeAction;
    let ChangeEOLAction = class ChangeEOLAction extends actions_1.Action {
        constructor(actionId, actionLabel, editorService, quickInputService) {
            super(actionId, actionLabel);
            this.editorService = editorService;
            this.quickInputService = quickInputService;
        }
        async run() {
            var _a, _b;
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(50, null) }]);
                return;
            }
            if ((_a = this.editorService.activeEditor) === null || _a === void 0 ? void 0 : _a.isReadonly()) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(51, null) }]);
                return;
            }
            let textModel = activeTextEditorControl.getModel();
            const EOLOptions = [
                { label: nlsEOLLF, eol: 0 /* LF */ },
                { label: nlsEOLCRLF, eol: 1 /* CRLF */ },
            ];
            const selectedIndex = ((textModel === null || textModel === void 0 ? void 0 : textModel.getEOL()) === '\n') ? 0 : 1;
            const eol = await this.quickInputService.pick(EOLOptions, { placeHolder: (0, nls_1.localize)(52, null), activeItem: EOLOptions[selectedIndex] });
            if (eol) {
                const activeCodeEditor = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
                if ((activeCodeEditor === null || activeCodeEditor === void 0 ? void 0 : activeCodeEditor.hasModel()) && !((_b = this.editorService.activeEditor) === null || _b === void 0 ? void 0 : _b.isReadonly())) {
                    textModel = activeCodeEditor.getModel();
                    textModel.pushStackElement();
                    textModel.pushEOL(eol.eol);
                    textModel.pushStackElement();
                }
            }
            activeTextEditorControl.focus();
        }
    };
    ChangeEOLAction.ID = 'workbench.action.editor.changeEOL';
    ChangeEOLAction.LABEL = (0, nls_1.localize)(49, null);
    ChangeEOLAction = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, quickInput_1.IQuickInputService)
    ], ChangeEOLAction);
    exports.ChangeEOLAction = ChangeEOLAction;
    let ChangeEncodingAction = class ChangeEncodingAction extends actions_1.Action {
        constructor(actionId, actionLabel, editorService, quickInputService, textResourceConfigurationService, fileService, textFileService) {
            super(actionId, actionLabel);
            this.editorService = editorService;
            this.quickInputService = quickInputService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.fileService = fileService;
            this.textFileService = textFileService;
        }
        async run() {
            const activeTextEditorControl = (0, editorBrowser_1.getCodeEditor)(this.editorService.activeTextEditorControl);
            if (!activeTextEditorControl) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(54, null) }]);
                return;
            }
            const activeEditorPane = this.editorService.activeEditorPane;
            if (!activeEditorPane) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(55, null) }]);
                return;
            }
            const encodingSupport = toEditorWithEncodingSupport(activeEditorPane.input);
            if (!encodingSupport) {
                await this.quickInputService.pick([{ label: (0, nls_1.localize)(56, null) }]);
                return;
            }
            const saveWithEncodingPick = { label: (0, nls_1.localize)(57, null) };
            const reopenWithEncodingPick = { label: (0, nls_1.localize)(58, null) };
            if (!platform_1.Language.isDefaultVariant()) {
                const saveWithEncodingAlias = 'Save with Encoding';
                if (saveWithEncodingAlias !== saveWithEncodingPick.label) {
                    saveWithEncodingPick.detail = saveWithEncodingAlias;
                }
                const reopenWithEncodingAlias = 'Reopen with Encoding';
                if (reopenWithEncodingAlias !== reopenWithEncodingPick.label) {
                    reopenWithEncodingPick.detail = reopenWithEncodingAlias;
                }
            }
            let action;
            if (encodingSupport instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
                action = saveWithEncodingPick;
            }
            else if (activeEditorPane.input.isReadonly()) {
                action = reopenWithEncodingPick;
            }
            else {
                action = await this.quickInputService.pick([reopenWithEncodingPick, saveWithEncodingPick], { placeHolder: (0, nls_1.localize)(59, null), matchOnDetail: true });
            }
            if (!action) {
                return;
            }
            await (0, async_1.timeout)(50); // quick input is sensitive to being opened so soon after another
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeEditorPane.input, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!resource || (!this.fileService.canHandleResource(resource) && resource.scheme !== network_1.Schemas.untitled)) {
                return; // encoding detection only possible for resources the file service can handle or that are untitled
            }
            let guessedEncoding = undefined;
            if (this.fileService.canHandleResource(resource)) {
                const content = await this.textFileService.readStream(resource, { autoGuessEncoding: true });
                guessedEncoding = content.encoding;
            }
            const isReopenWithEncoding = (action === reopenWithEncodingPick);
            const configuredEncoding = this.textResourceConfigurationService.getValue((0, types_1.withNullAsUndefined)(resource), 'files.encoding');
            let directMatchIndex;
            let aliasMatchIndex;
            // All encodings are valid picks
            const picks = Object.keys(encoding_1.SUPPORTED_ENCODINGS)
                .sort((k1, k2) => {
                if (k1 === configuredEncoding) {
                    return -1;
                }
                else if (k2 === configuredEncoding) {
                    return 1;
                }
                return encoding_1.SUPPORTED_ENCODINGS[k1].order - encoding_1.SUPPORTED_ENCODINGS[k2].order;
            })
                .filter(k => {
                if (k === guessedEncoding && guessedEncoding !== configuredEncoding) {
                    return false; // do not show encoding if it is the guessed encoding that does not match the configured
                }
                return !isReopenWithEncoding || !encoding_1.SUPPORTED_ENCODINGS[k].encodeOnly; // hide those that can only be used for encoding if we are about to decode
            })
                .map((key, index) => {
                if (key === encodingSupport.getEncoding()) {
                    directMatchIndex = index;
                }
                else if (encoding_1.SUPPORTED_ENCODINGS[key].alias === encodingSupport.getEncoding()) {
                    aliasMatchIndex = index;
                }
                return { id: key, label: encoding_1.SUPPORTED_ENCODINGS[key].labelLong, description: key };
            });
            const items = picks.slice();
            // If we have a guessed encoding, show it first unless it matches the configured encoding
            if (guessedEncoding && configuredEncoding !== guessedEncoding && encoding_1.SUPPORTED_ENCODINGS[guessedEncoding]) {
                picks.unshift({ type: 'separator' });
                picks.unshift({ id: guessedEncoding, label: encoding_1.SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: (0, nls_1.localize)(60, null) });
            }
            const encoding = await this.quickInputService.pick(picks, {
                placeHolder: isReopenWithEncoding ? (0, nls_1.localize)(61, null) : (0, nls_1.localize)(62, null),
                activeItem: items[typeof directMatchIndex === 'number' ? directMatchIndex : typeof aliasMatchIndex === 'number' ? aliasMatchIndex : -1]
            });
            if (!encoding) {
                return;
            }
            if (!this.editorService.activeEditorPane) {
                return;
            }
            const activeEncodingSupport = toEditorWithEncodingSupport(this.editorService.activeEditorPane.input);
            if (typeof encoding.id !== 'undefined' && activeEncodingSupport && activeEncodingSupport.getEncoding() !== encoding.id) {
                await activeEncodingSupport.setEncoding(encoding.id, isReopenWithEncoding ? 1 /* Decode */ : 0 /* Encode */); // Set new encoding
            }
            activeTextEditorControl.focus();
        }
    };
    ChangeEncodingAction.ID = 'workbench.action.editor.changeEncoding';
    ChangeEncodingAction.LABEL = (0, nls_1.localize)(53, null);
    ChangeEncodingAction = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, textResourceConfigurationService_1.ITextResourceConfigurationService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService)
    ], ChangeEncodingAction);
    exports.ChangeEncodingAction = ChangeEncodingAction;
});
//# sourceMappingURL=editorStatus.js.map