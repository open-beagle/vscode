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
define(["require", "exports", "vs/workbench/common/editor/editorGroupModel", "vs/workbench/common/editor", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dom", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/base/browser/ui/progressbar/progressbar", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/browser/parts/editor/tabsTitleControl", "vs/workbench/browser/parts/editor/editorControl", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressIndicator", "vs/nls!vs/workbench/browser/parts/editor/editorGroupView", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/platform/notification/common/notification", "vs/base/common/errorMessage", "vs/platform/telemetry/common/telemetry", "vs/base/common/async", "vs/base/browser/touch", "vs/workbench/browser/parts/editor/editor", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/keybinding/common/keybinding", "vs/base/common/actions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/browser/parts/editor/noTabsTitleControl", "vs/platform/actions/common/actions", "vs/base/browser/mouseEvent", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextview/browser/contextView", "vs/workbench/services/editor/common/editorService", "vs/base/common/hash", "vs/base/common/mime", "vs/base/common/resources", "vs/base/common/network", "vs/platform/editor/common/editor", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/base/common/codicons", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/types", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/css!./media/editorgroupview"], function (require, exports, editorGroupModel_1, editor_1, event_1, instantiation_1, dom_1, serviceCollection_1, contextkey_1, progressbar_1, styler_1, themeService_1, colorRegistry_1, theme_1, tabsTitleControl_1, editorControl_1, progress_1, progressIndicator_1, nls_1, errors_1, lifecycle_1, notification_1, errorMessage_1, telemetry_1, async_1, touch_1, editor_2, actionbar_1, keybinding_1, actions_1, editorCommands_1, noTabsTitleControl_1, actions_2, mouseEvent_1, menuEntryActionViewItem_1, contextView_1, editorService_1, hash_1, mime_1, resources_1, network_1, editor_3, dialogs_1, log_1, codicons_1, filesConfigurationService_1, types_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorGroupView = void 0;
    let EditorGroupView = class EditorGroupView extends themeService_1.Themable {
        constructor(accessor, from, _index, instantiationService, contextKeyService, themeService, notificationService, dialogService, telemetryService, keybindingService, menuService, contextMenuService, fileDialogService, logService, editorService, filesConfigurationService, uriIdentityService) {
            var _a;
            super(themeService);
            this.accessor = accessor;
            this._index = _index;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.telemetryService = telemetryService;
            this.keybindingService = keybindingService;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.fileDialogService = fileDialogService;
            this.logService = logService;
            this.editorService = editorService;
            this.filesConfigurationService = filesConfigurationService;
            this.uriIdentityService = uriIdentityService;
            //#region events
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this._onDidGroupChange = this._register(new event_1.Emitter());
            this.onDidGroupChange = this._onDidGroupChange.event;
            this._onDidOpenEditorFail = this._register(new event_1.Emitter());
            this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
            this._onWillCloseEditor = this._register(new event_1.Emitter());
            this.onWillCloseEditor = this._onWillCloseEditor.event;
            this._onDidCloseEditor = this._register(new event_1.Emitter());
            this.onDidCloseEditor = this._onDidCloseEditor.event;
            this._onWillMoveEditor = this._register(new event_1.Emitter());
            this.onWillMoveEditor = this._onWillMoveEditor.event;
            this.disposedEditorsWorker = this._register(new async_1.RunOnceWorker(editors => this.handleDisposedEditors(editors), 0));
            this.mapEditorToPendingConfirmation = new Map();
            this.whenRestored = new Promise(resolve => (this.whenRestoredResolve = resolve));
            this.isRestored = false;
            this._disposed = false;
            //#endregion
            //#region ISerializableView
            this.element = document.createElement('div');
            this._onDidChange = this._register(new event_1.Relay());
            this.onDidChange = this._onDidChange.event;
            if (from instanceof EditorGroupView) {
                this.model = this._register(from.model.clone());
            }
            else if ((0, editorGroupModel_1.isSerializedEditorGroupModel)(from)) {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, from));
            }
            else {
                this.model = this._register(instantiationService.createInstance(editorGroupModel_1.EditorGroupModel, undefined));
            }
            //#region create()
            {
                // Container
                this.element.classList.add('editor-group-container');
                // Container listeners
                this.registerContainerListeners();
                // Container toolbar
                this.createContainerToolbar();
                // Container context menu
                this.createContainerContextMenu();
                // Letterpress container
                const letterpressContainer = document.createElement('div');
                letterpressContainer.classList.add('editor-group-letterpress');
                this.element.appendChild(letterpressContainer);
                // Progress bar
                this.progressBar = this._register(new progressbar_1.ProgressBar(this.element));
                this._register((0, styler_1.attachProgressBarStyler)(this.progressBar, this.themeService));
                this.progressBar.hide();
                // Scoped services
                this.scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
                this.scopedInstantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService], [progress_1.IEditorProgressService, this._register(new progressIndicator_1.EditorProgressIndicator(this.progressBar, this))]));
                // Context keys
                this.handleGroupContextKeys();
                // Title container
                this.titleContainer = document.createElement('div');
                this.titleContainer.classList.add('title');
                this.element.appendChild(this.titleContainer);
                // Title control
                this.titleAreaControl = this.createTitleAreaControl();
                // Editor container
                this.editorContainer = document.createElement('div');
                this.editorContainer.classList.add('editor-container');
                this.element.appendChild(this.editorContainer);
                // Editor control
                this.editorControl = this._register(this.scopedInstantiationService.createInstance(editorControl_1.EditorControl, this.editorContainer, this));
                this._onDidChange.input = this.editorControl.onDidChangeSizeConstraints;
                // Track Focus
                this.doTrackFocus();
                // Update containers
                this.updateTitleContainer();
                this.updateContainer();
                // Update styles
                this.updateStyles();
            }
            //#endregion
            // Restore editors if provided
            const restoreEditorsPromise = (_a = this.restoreEditors(from)) !== null && _a !== void 0 ? _a : Promise.resolve();
            // Signal restored once editors have restored
            restoreEditorsPromise.finally(() => {
                var _a;
                this.isRestored = true;
                (_a = this.whenRestoredResolve) === null || _a === void 0 ? void 0 : _a.call(this);
            });
            // Register Listeners
            this.registerListeners();
        }
        //#region factory
        static createNew(accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView, accessor, null, index);
        }
        static createFromSerialized(serialized, accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView, accessor, serialized, index);
        }
        static createCopy(copyFrom, accessor, index, instantiationService) {
            return instantiationService.createInstance(EditorGroupView, accessor, copyFrom, index);
        }
        handleGroupContextKeys() {
            const groupActiveEditorDirtyContext = editor_1.ActiveEditorDirtyContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorPinnedContext = editor_1.ActiveEditorPinnedContext.bindTo(this.scopedContextKeyService);
            const groupActiveEditorStickyContext = editor_1.ActiveEditorStickyContext.bindTo(this.scopedContextKeyService);
            const groupEditorsCountContext = editor_1.EditorGroupEditorsCountContext.bindTo(this.scopedContextKeyService);
            const activeEditorListener = new lifecycle_1.MutableDisposable();
            const observeActiveEditor = () => {
                activeEditorListener.clear();
                const activeEditor = this.model.activeEditor;
                if (activeEditor) {
                    groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    activeEditorListener.value = activeEditor.onDidChangeDirty(() => {
                        groupActiveEditorDirtyContext.set(activeEditor.isDirty() && !activeEditor.isSaving());
                    });
                }
                else {
                    groupActiveEditorDirtyContext.set(false);
                }
            };
            // Update group contexts based on group changes
            this._register(this.onDidGroupChange(e => {
                switch (e.kind) {
                    case 5 /* EDITOR_ACTIVE */:
                        // Track the active editor and update context key that reflects
                        // the dirty state of this editor
                        observeActiveEditor();
                        break;
                    case 7 /* EDITOR_PIN */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorPinnedContext.set(this.model.isPinned(this.model.activeEditor));
                        }
                        break;
                    case 8 /* EDITOR_STICKY */:
                        if (e.editor && e.editor === this.model.activeEditor) {
                            groupActiveEditorStickyContext.set(this.model.isSticky(this.model.activeEditor));
                        }
                        break;
                }
                // Group editors count context
                groupEditorsCountContext.set(this.count);
            }));
            observeActiveEditor();
        }
        registerContainerListeners() {
            // Open new file via doubleclick on empty container
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.DBLCLICK, e => {
                if (this.isEmpty) {
                    dom_1.EventHelper.stop(e);
                    this.openEditor(this.editorService.createEditorInput({ forceUntitled: true }), editor_1.EditorOptions.create({ pinned: true }));
                }
            }));
            // Close empty editor group via middle mouse click
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.AUXCLICK, e => {
                if (this.isEmpty && e.button === 1 /* Middle Button */) {
                    dom_1.EventHelper.stop(e, true);
                    this.accessor.removeGroup(this);
                }
            }));
        }
        createContainerToolbar() {
            // Toolbar Container
            const toolbarContainer = document.createElement('div');
            toolbarContainer.classList.add('editor-group-container-toolbar');
            this.element.appendChild(toolbarContainer);
            // Toolbar
            const groupId = this.model.id;
            const containerToolbar = this._register(new actionbar_1.ActionBar(toolbarContainer, {
                ariaLabel: (0, nls_1.localize)(0, null), actionRunner: this._register(new class extends actions_1.ActionRunner {
                    async run(action) {
                        await action.run(groupId);
                    }
                })
            }));
            // Toolbar actions
            const removeGroupAction = this._register(new actions_1.Action(editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, (0, nls_1.localize)(1, null), codicons_1.Codicon.close.classNames, true, async () => this.accessor.removeGroup(this)));
            const keybinding = this.keybindingService.lookupKeybinding(removeGroupAction.id);
            containerToolbar.push(removeGroupAction, { icon: true, label: false, keybinding: keybinding ? keybinding.getLabel() : undefined });
        }
        createContainerContextMenu() {
            const menu = this._register(this.menuService.createMenu(actions_2.MenuId.EmptyEditorGroupContext, this.contextKeyService));
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.CONTEXT_MENU, e => this.onShowContainerContextMenu(menu, e)));
            this._register((0, dom_1.addDisposableListener)(this.element, touch_1.EventType.Contextmenu, () => this.onShowContainerContextMenu(menu)));
        }
        onShowContainerContextMenu(menu, e) {
            if (!this.isEmpty) {
                return; // only for empty editor groups
            }
            // Find target anchor
            let anchor = this.element;
            if (e instanceof MouseEvent) {
                const event = new mouseEvent_1.StandardMouseEvent(e);
                anchor = { x: event.posx, y: event.posy };
            }
            // Fill in contributed actions
            const actions = [];
            const actionsDisposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
            // Show it
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                onHide: () => {
                    this.focus();
                    (0, lifecycle_1.dispose)(actionsDisposable);
                }
            });
        }
        doTrackFocus() {
            // Container
            const containerFocusTracker = this._register((0, dom_1.trackFocus)(this.element));
            this._register(containerFocusTracker.onDidFocus(() => {
                if (this.isEmpty) {
                    this._onDidFocus.fire(); // only when empty to prevent accident focus
                }
            }));
            // Title Container
            const handleTitleClickOrTouch = (e) => {
                let target;
                if (e instanceof MouseEvent) {
                    if (e.button !== 0) {
                        return undefined; // only for left mouse click
                    }
                    target = e.target;
                }
                else {
                    target = e.initialTarget;
                }
                if ((0, dom_1.findParentWithClass)(target, 'monaco-action-bar', this.titleContainer) ||
                    (0, dom_1.findParentWithClass)(target, 'monaco-breadcrumb-item', this.titleContainer)) {
                    return; // not when clicking on actions or breadcrumbs
                }
                // timeout to keep focus in editor after mouse up
                setTimeout(() => {
                    this.focus();
                });
            };
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, dom_1.EventType.MOUSE_DOWN, e => handleTitleClickOrTouch(e)));
            this._register((0, dom_1.addDisposableListener)(this.titleContainer, touch_1.EventType.Tap, e => handleTitleClickOrTouch(e)));
            // Editor Container
            this._register(this.editorControl.onDidFocus(() => {
                this._onDidFocus.fire();
            }));
        }
        updateContainer() {
            // Empty Container: add some empty container attributes
            if (this.isEmpty) {
                this.element.classList.add('empty');
                this.element.tabIndex = 0;
                this.element.setAttribute('aria-label', (0, nls_1.localize)(2, null, this.label));
            }
            // Non-Empty Container: revert empty container attributes
            else {
                this.element.classList.remove('empty');
                this.element.removeAttribute('tabIndex');
                this.element.removeAttribute('aria-label');
            }
            // Update styles
            this.updateStyles();
        }
        updateTitleContainer() {
            this.titleContainer.classList.toggle('tabs', this.accessor.partOptions.showTabs);
            this.titleContainer.classList.toggle('show-file-icons', this.accessor.partOptions.showIcons);
        }
        createTitleAreaControl() {
            // Clear old if existing
            if (this.titleAreaControl) {
                this.titleAreaControl.dispose();
                (0, dom_1.clearNode)(this.titleContainer);
            }
            // Create new based on options
            if (this.accessor.partOptions.showTabs) {
                this.titleAreaControl = this.scopedInstantiationService.createInstance(tabsTitleControl_1.TabsTitleControl, this.titleContainer, this.accessor, this);
            }
            else {
                this.titleAreaControl = this.scopedInstantiationService.createInstance(noTabsTitleControl_1.NoTabsTitleControl, this.titleContainer, this.accessor, this);
            }
            return this.titleAreaControl;
        }
        restoreEditors(from) {
            if (this.model.count === 0) {
                return; // nothing to show
            }
            // Determine editor options
            let options;
            if (from instanceof EditorGroupView) {
                options = (0, editor_2.getActiveTextEditorOptions)(from); // if we copy from another group, ensure to copy its active editor viewstate
            }
            else {
                options = new editor_1.EditorOptions();
            }
            const activeEditor = this.model.activeEditor;
            if (!activeEditor) {
                return;
            }
            options.pinned = this.model.isPinned(activeEditor); // preserve pinned state
            options.sticky = this.model.isSticky(activeEditor); // preserve sticky state
            options.preserveFocus = true; // handle focus after editor is opened
            const activeElement = document.activeElement;
            // Show active editor (intentionally not using async to keep
            // `restoreEditors` from executing in same stack)
            return this.doShowEditor(activeEditor, { active: true, isNew: false /* restored */ }, options).then(() => {
                // Set focused now if this is the active group and focus has
                // not changed meanwhile. This prevents focus from being
                // stolen accidentally on startup when the user already
                // clicked somewhere.
                if (this.accessor.activeGroup === this && activeElement === document.activeElement) {
                    this.focus();
                }
            });
        }
        //#region event handling
        registerListeners() {
            // Model Events
            this._register(this.model.onDidChangeEditorPinned(editor => this.onDidChangeEditorPinned(editor)));
            this._register(this.model.onDidChangeEditorSticky(editor => this.onDidChangeEditorSticky(editor)));
            this._register(this.model.onDidOpenEditor(editor => this.onDidOpenEditor(editor)));
            this._register(this.model.onDidCloseEditor(editor => this.handleOnDidCloseEditor(editor)));
            this._register(this.model.onWillDisposeEditor(editor => this.onWillDisposeEditor(editor)));
            this._register(this.model.onDidChangeEditorDirty(editor => this.onDidChangeEditorDirty(editor)));
            this._register(this.model.onDidEditorLabelChange(editor => this.onDidEditorLabelChange(editor)));
            // Option Changes
            this._register(this.accessor.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
            // Visibility
            this._register(this.accessor.onDidVisibilityChange(e => this.onDidVisibilityChange(e)));
        }
        onDidChangeEditorPinned(editor) {
            this._onDidGroupChange.fire({ kind: 7 /* EDITOR_PIN */, editor });
        }
        onDidChangeEditorSticky(editor) {
            this._onDidGroupChange.fire({ kind: 8 /* EDITOR_STICKY */, editor });
        }
        onDidOpenEditor(editor) {
            /* __GDPR__
                "editorOpened" : {
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorOpened', this.toEditorTelemetryDescriptor(editor));
            // Update container
            this.updateContainer();
            // Event
            this._onDidGroupChange.fire({ kind: 2 /* EDITOR_OPEN */, editor });
        }
        handleOnDidCloseEditor(event) {
            // Before close
            this._onWillCloseEditor.fire(event);
            // Handle event
            const editor = event.editor;
            const editorsToClose = [editor];
            // Include both sides of side by side editors when being closed
            if (editor instanceof editor_1.SideBySideEditorInput) {
                editorsToClose.push(editor.primary, editor.secondary);
            }
            // For each editor to close, we call dispose() to free up any resources.
            // However, certain editors might be shared across multiple editor groups
            // (including being visible in side by side / diff editors) and as such we
            // only dispose when they are not opened elsewhere.
            for (const editor of editorsToClose) {
                if (this.canDispose(editor)) {
                    editor.dispose();
                }
            }
            /* __GDPR__
                "editorClosed" : {
                    "${include}": [
                        "${EditorTelemetryDescriptor}"
                    ]
                }
            */
            this.telemetryService.publicLog('editorClosed', this.toEditorTelemetryDescriptor(event.editor));
            // Update container
            this.updateContainer();
            // Event
            this._onDidCloseEditor.fire(event);
            this._onDidGroupChange.fire({ kind: 3 /* EDITOR_CLOSE */, editor, editorIndex: event.index });
        }
        canDispose(editor) {
            for (const groupView of this.accessor.groups) {
                if (groupView instanceof EditorGroupView && groupView.model.contains(editor, {
                    strictEquals: true,
                    supportSideBySide: true // include side by side editor primary & secondary
                })) {
                    return false;
                }
            }
            return true;
        }
        toEditorTelemetryDescriptor(editor) {
            const descriptor = editor.getTelemetryDescriptor();
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(editor);
            const path = resource ? resource.scheme === network_1.Schemas.file ? resource.fsPath : resource.path : undefined;
            if (resource && path) {
                descriptor['resource'] = { mimeType: (0, mime_1.guessMimeTypes)(resource).join(', '), scheme: resource.scheme, ext: (0, resources_1.extname)(resource), path: (0, hash_1.hash)(path) };
                /* __GDPR__FRAGMENT__
                    "EditorTelemetryDescriptor" : {
                        "resource": { "${inline}": [ "${URIDescriptor}" ] }
                    }
                */
                return descriptor;
            }
            return descriptor;
        }
        onWillDisposeEditor(editor) {
            // To prevent race conditions, we handle disposed editors in our worker with a timeout
            // because it can happen that an input is being disposed with the intent to replace
            // it with some other input right after.
            this.disposedEditorsWorker.work(editor);
        }
        handleDisposedEditors(editors) {
            // Split between visible and hidden editors
            let activeEditor;
            const inactiveEditors = [];
            for (const editor of editors) {
                if (this.model.isActive(editor)) {
                    activeEditor = editor;
                }
                else if (this.model.contains(editor)) {
                    inactiveEditors.push(editor);
                }
            }
            // Close all inactive editors first to prevent UI flicker
            for (const inactiveEditor of inactiveEditors) {
                this.doCloseEditor(inactiveEditor, false);
            }
            // Close active one last
            if (activeEditor) {
                this.doCloseEditor(activeEditor, false);
            }
        }
        onDidChangeEditorPartOptions(event) {
            // Title container
            this.updateTitleContainer();
            // Title control Switch between showing tabs <=> not showing tabs
            if (event.oldPartOptions.showTabs !== event.newPartOptions.showTabs) {
                // Recreate title control
                this.createTitleAreaControl();
                // Re-layout
                this.relayout();
                // Ensure to show active editor if any
                if (this.model.activeEditor) {
                    this.titleAreaControl.openEditor(this.model.activeEditor);
                }
            }
            // Just update title control
            else {
                this.titleAreaControl.updateOptions(event.oldPartOptions, event.newPartOptions);
            }
            // Styles
            this.updateStyles();
            // Pin preview editor once user disables preview
            if (event.oldPartOptions.enablePreview && !event.newPartOptions.enablePreview) {
                if (this.model.previewEditor) {
                    this.pinEditor(this.model.previewEditor);
                }
            }
        }
        onDidChangeEditorDirty(editor) {
            // Always show dirty editors pinned
            this.pinEditor(editor);
            // Forward to title control
            this.titleAreaControl.updateEditorDirty(editor);
            // Event
            this._onDidGroupChange.fire({ kind: 9 /* EDITOR_DIRTY */, editor });
        }
        onDidEditorLabelChange(editor) {
            // Forward to title control
            this.titleAreaControl.updateEditorLabel(editor);
            // Event
            this._onDidGroupChange.fire({ kind: 6 /* EDITOR_LABEL */, editor });
        }
        onDidVisibilityChange(visible) {
            // Forward to editor control
            this.editorControl.setVisible(visible);
        }
        //#endregion
        //#region IEditorGroupView
        get index() {
            return this._index;
        }
        get label() {
            return (0, nls_1.localize)(3, null, this._index + 1);
        }
        get ariaLabel() {
            return (0, nls_1.localize)(4, null, this._index + 1);
        }
        get disposed() {
            return this._disposed;
        }
        get isEmpty() {
            return this.model.count === 0;
        }
        get titleHeight() {
            return this.titleAreaControl.getHeight();
        }
        get isMinimized() {
            if (!this.dimension) {
                return false;
            }
            return this.dimension.width === this.minimumWidth || this.dimension.height === this.minimumHeight;
        }
        notifyIndexChanged(newIndex) {
            if (this._index !== newIndex) {
                this._index = newIndex;
                this._onDidGroupChange.fire({ kind: 1 /* GROUP_INDEX */ });
            }
        }
        setActive(isActive) {
            this.active = isActive;
            // Update container
            this.element.classList.toggle('active', isActive);
            this.element.classList.toggle('inactive', !isActive);
            // Update title control
            this.titleAreaControl.setActive(isActive);
            // Update styles
            this.updateStyles();
            // Event
            this._onDidGroupChange.fire({ kind: 0 /* GROUP_ACTIVE */ });
        }
        //#endregion
        //#region IEditorGroup
        //#region basics()
        get id() {
            return this.model.id;
        }
        get editors() {
            return this.model.getEditors(1 /* SEQUENTIAL */);
        }
        get count() {
            return this.model.count;
        }
        get stickyCount() {
            return this.model.stickyCount;
        }
        get activeEditorPane() {
            return this.editorControl ? (0, types_1.withNullAsUndefined)(this.editorControl.activeEditorPane) : undefined;
        }
        get activeEditor() {
            return this.model.activeEditor;
        }
        get previewEditor() {
            return this.model.previewEditor;
        }
        isPinned(editor) {
            return this.model.isPinned(editor);
        }
        isSticky(editorOrIndex) {
            return this.model.isSticky(editorOrIndex);
        }
        isActive(editor) {
            return this.model.isActive(editor);
        }
        contains(candidate) {
            return this.model.contains(candidate);
        }
        getEditors(order, options) {
            return this.model.getEditors(order, options);
        }
        findEditors(resource) {
            const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
            return this.getEditors(1 /* SEQUENTIAL */).filter(editor => {
                return editor.resource && (0, resources_1.isEqual)(editor.resource, canonicalResource);
            });
        }
        getEditorByIndex(index) {
            return this.model.getEditorByIndex(index);
        }
        getIndexOfEditor(editor) {
            return this.model.indexOf(editor);
        }
        focus() {
            // Pass focus to editor panes
            if (this.activeEditorPane) {
                this.activeEditorPane.focus();
            }
            else {
                this.element.focus();
            }
            // Event
            this._onDidFocus.fire();
        }
        pinEditor(candidate = this.activeEditor || undefined) {
            if (candidate && !this.model.isPinned(candidate)) {
                // Update model
                const editor = this.model.pin(candidate);
                // Forward to title control
                if (editor) {
                    this.titleAreaControl.pinEditor(editor);
                }
            }
        }
        stickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, true);
        }
        unstickEditor(candidate = this.activeEditor || undefined) {
            this.doStickEditor(candidate, false);
        }
        doStickEditor(candidate, sticky) {
            if (candidate && this.model.isSticky(candidate) !== sticky) {
                const oldIndexOfEditor = this.getIndexOfEditor(candidate);
                // Update model
                const editor = sticky ? this.model.stick(candidate) : this.model.unstick(candidate);
                if (!editor) {
                    return;
                }
                // If the index of the editor changed, we need to forward this to
                // title control and also make sure to emit this as an event
                const newIndexOfEditor = this.getIndexOfEditor(editor);
                if (newIndexOfEditor !== oldIndexOfEditor) {
                    this.titleAreaControl.moveEditor(editor, oldIndexOfEditor, newIndexOfEditor);
                    // Event
                    this._onDidGroupChange.fire({ kind: 4 /* EDITOR_MOVE */, editor });
                }
                // Forward sticky state to title control
                if (sticky) {
                    this.titleAreaControl.stickEditor(editor);
                }
                else {
                    this.titleAreaControl.unstickEditor(editor);
                }
            }
        }
        //#endregion
        //#region openEditor()
        async openEditor(editor, options) {
            // Guard against invalid inputs
            if (!editor) {
                return undefined;
            }
            // Proceed with opening
            return this.doOpenEditor(editor, options);
        }
        async doOpenEditor(editor, options) {
            var _a;
            // Guard against invalid inputs. Disposed inputs
            // should never open because they emit no events
            // e.g. to indicate dirty changes.
            if (editor.isDisposed()) {
                return;
            }
            // Determine options
            const openEditorOptions = {
                index: options ? options.index : undefined,
                pinned: (options === null || options === void 0 ? void 0 : options.sticky) || !this.accessor.partOptions.enablePreview || editor.isDirty() || ((_a = options === null || options === void 0 ? void 0 : options.pinned) !== null && _a !== void 0 ? _a : typeof (options === null || options === void 0 ? void 0 : options.index) === 'number' /* unless specified, prefer to pin when opening with index */) || (typeof (options === null || options === void 0 ? void 0 : options.index) === 'number' && this.model.isSticky(options.index)),
                sticky: (options === null || options === void 0 ? void 0 : options.sticky) || (typeof (options === null || options === void 0 ? void 0 : options.index) === 'number' && this.model.isSticky(options.index)),
                active: this.model.count === 0 || !options || !options.inactive
            };
            if ((options === null || options === void 0 ? void 0 : options.sticky) && typeof (options === null || options === void 0 ? void 0 : options.index) === 'number' && !this.model.isSticky(options.index)) {
                // Special case: we are to open an editor sticky but at an index that is not sticky
                // In that case we prefer to open the editor at the index but not sticky. This enables
                // to drag a sticky editor to an index that is not sticky to unstick it.
                openEditorOptions.sticky = false;
            }
            if (!openEditorOptions.active && !openEditorOptions.pinned && this.model.activeEditor && !this.model.isPinned(this.model.activeEditor)) {
                // Special case: we are to open an editor inactive and not pinned, but the current active
                // editor is also not pinned, which means it will get replaced with this one. As such,
                // the editor can only be active.
                openEditorOptions.active = true;
            }
            let activateGroup = false;
            let restoreGroup = false;
            if ((options === null || options === void 0 ? void 0 : options.activation) === editor_3.EditorActivation.ACTIVATE) {
                // Respect option to force activate an editor group.
                activateGroup = true;
            }
            else if ((options === null || options === void 0 ? void 0 : options.activation) === editor_3.EditorActivation.RESTORE) {
                // Respect option to force restore an editor group.
                restoreGroup = true;
            }
            else if ((options === null || options === void 0 ? void 0 : options.activation) === editor_3.EditorActivation.PRESERVE) {
                // Respect option to preserve active editor group.
                activateGroup = false;
                restoreGroup = false;
            }
            else if (openEditorOptions.active) {
                // Finally, we only activate/restore an editor which is
                // opening as active editor.
                // If preserveFocus is enabled, we only restore but never
                // activate the group.
                activateGroup = !options || !options.preserveFocus;
                restoreGroup = !activateGroup;
            }
            // Actually move the editor if a specific index is provided and we figure
            // out that the editor is already opened at a different index. This
            // ensures the right set of events are fired to the outside.
            if (typeof openEditorOptions.index === 'number') {
                const indexOfEditor = this.model.indexOf(editor);
                if (indexOfEditor !== -1 && indexOfEditor !== openEditorOptions.index) {
                    this.doMoveEditorInsideGroup(editor, openEditorOptions);
                }
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const { editor: openedEditor, isNew } = this.model.openEditor(editor, openEditorOptions);
            // Show editor
            const showEditorResult = this.doShowEditor(openedEditor, { active: !!openEditorOptions.active, isNew }, options);
            // Finally make sure the group is active or restored as instructed
            if (activateGroup) {
                this.accessor.activateGroup(this);
            }
            else if (restoreGroup) {
                this.accessor.restoreGroup(this);
            }
            return showEditorResult;
        }
        doShowEditor(editor, context, options) {
            // Show in editor control if the active editor changed
            let openEditorPromise;
            if (context.active) {
                openEditorPromise = (async () => {
                    try {
                        const result = await this.editorControl.openEditor(editor, options, { newInGroup: context.isNew });
                        // Editor change event
                        if (result.editorChanged) {
                            this._onDidGroupChange.fire({ kind: 5 /* EDITOR_ACTIVE */, editor });
                        }
                        return result.editorPane;
                    }
                    catch (error) {
                        // Handle errors but do not bubble them up
                        this.doHandleOpenEditorError(error, editor, options);
                        return undefined; // error: return undefined as result to signal this
                    }
                })();
            }
            else {
                openEditorPromise = Promise.resolve(undefined); // inactive: return undefined as result to signal this
            }
            // Show in title control after editor control because some actions depend on it
            this.titleAreaControl.openEditor(editor);
            return openEditorPromise;
        }
        async doHandleOpenEditorError(error, editor, options) {
            var _a;
            // Report error only if we are not told to ignore errors that occur from opening an editor
            if (!(0, errors_1.isPromiseCanceledError)(error) && (!options || !options.ignoreError)) {
                // Since it is more likely that errors fail to open when restoring them e.g.
                // because files got deleted or moved meanwhile, we do not show any notifications
                // if we are still restoring editors.
                if (this.isRestored) {
                    // Extract possible error actions from the error
                    let errorActions = undefined;
                    if ((0, errors_1.isErrorWithActions)(error)) {
                        errorActions = error.actions;
                    }
                    // If the context is USER, we try to show a modal dialog instead of a background notification
                    if ((options === null || options === void 0 ? void 0 : options.context) === editor_3.EditorOpenContext.USER) {
                        const buttons = [];
                        if (Array.isArray(errorActions) && errorActions.length > 0) {
                            for (const errorAction of errorActions) {
                                buttons.push(errorAction.label);
                            }
                        }
                        else {
                            buttons.push((0, nls_1.localize)(5, null));
                        }
                        let cancelId = undefined;
                        if (buttons.length === 1) {
                            buttons.push((0, nls_1.localize)(6, null));
                            cancelId = 1;
                        }
                        const result = await this.dialogService.show(notification_1.Severity.Error, (0, nls_1.localize)(7, null, editor.getName()), buttons, {
                            detail: (0, errorMessage_1.toErrorMessage)(error),
                            cancelId
                        });
                        // Make sure to run any error action if present
                        if (result.choice !== cancelId && Array.isArray(errorActions)) {
                            const errorAction = errorActions[result.choice];
                            if (errorAction) {
                                errorAction.run();
                            }
                        }
                    }
                    // Otherwise, show a background notification.
                    else {
                        const actions = { primary: [] };
                        if (Array.isArray(errorActions)) {
                            actions.primary = errorActions;
                        }
                        const handle = this.notificationService.notify({
                            id: `${(0, hash_1.hash)((_a = editor.resource) === null || _a === void 0 ? void 0 : _a.toString())}`,
                            severity: notification_1.Severity.Error,
                            message: (0, nls_1.localize)(8, null, editor.getName(), (0, errorMessage_1.toErrorMessage)(error)),
                            actions
                        });
                        event_1.Event.once(handle.onDidClose)(() => actions.primary && (0, lifecycle_1.dispose)(actions.primary));
                    }
                }
                // Restoring: just log errors to console
                else {
                    this.logService.error(error);
                }
            }
            // Event
            this._onDidOpenEditorFail.fire(editor);
            // Recover by closing the active editor (if the input is still the active one)
            if (this.activeEditor === editor) {
                const focusNext = !options || !options.preserveFocus;
                this.doCloseEditor(editor, focusNext, true /* from error */);
            }
        }
        //#endregion
        //#region openEditors()
        async openEditors(editors) {
            if (!editors.length) {
                return null;
            }
            // Do not modify original array
            editors = editors.slice(0);
            // Use the first editor as active editor
            const { editor, options } = editors.shift();
            await this.openEditor(editor, options);
            // Open the other ones inactive
            const startingIndex = this.getIndexOfEditor(editor) + 1;
            await async_1.Promises.settled(editors.map(async ({ editor, options }, index) => {
                const adjustedEditorOptions = options || new editor_1.EditorOptions();
                adjustedEditorOptions.inactive = true;
                adjustedEditorOptions.pinned = true;
                adjustedEditorOptions.index = startingIndex + index;
                await this.openEditor(editor, adjustedEditorOptions);
            }));
            // Opening many editors at once can put any editor to be
            // the active one depending on options. As such, we simply
            // return the active control after this operation.
            return this.editorControl.activeEditorPane;
        }
        //#endregion
        //#region moveEditor()
        moveEditor(editor, target, options) {
            // Move within same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Move across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, false);
            }
        }
        doMoveEditorInsideGroup(candidate, options) {
            const moveToIndex = options ? options.index : undefined;
            if (typeof moveToIndex !== 'number') {
                return; // do nothing if we move into same group without index
            }
            const currentIndex = this.model.indexOf(candidate);
            if (currentIndex === -1 || currentIndex === moveToIndex) {
                return; // do nothing if editor unknown in model or is already at the given index
            }
            // Update model and make sure to continue to use the editor we get from
            // the model. It is possible that the editor was already opened and we
            // want to ensure that we use the existing instance in that case.
            const editor = this.model.getEditorByIndex(currentIndex);
            if (!editor) {
                return;
            }
            // Update model
            this.model.moveEditor(editor, moveToIndex);
            this.model.pin(editor);
            // Forward to title area
            this.titleAreaControl.moveEditor(editor, currentIndex, moveToIndex);
            this.titleAreaControl.pinEditor(editor);
            // Event
            this._onDidGroupChange.fire({ kind: 4 /* EDITOR_MOVE */, editor });
        }
        doMoveOrCopyEditorAcrossGroups(editor, target, openOptions, keepCopy) {
            // When moving/copying an editor, try to preserve as much view state as possible
            // by checking for the editor to be a text editor and creating the options accordingly
            // if so
            const options = (0, editor_2.getActiveTextEditorOptions)(this, editor, editor_1.EditorOptions.create(Object.assign(Object.assign({}, openOptions), { pinned: true, sticky: !keepCopy && this.model.isSticky(editor) // preserve sticky state only if editor is moved (https://github.com/microsoft/vscode/issues/99035)
             })));
            // Indicate will move event
            if (!keepCopy) {
                this._onWillMoveEditor.fire({
                    groupId: this.id,
                    editor,
                    target: target.id,
                });
            }
            // A move to another group is an open first...
            target.openEditor(keepCopy ? editor.copy() : editor, options);
            // ...and a close afterwards (unless we copy)
            if (!keepCopy) {
                this.doCloseEditor(editor, false /* do not focus next one behind if any */);
            }
        }
        //#endregion
        //#region copyEditor()
        copyEditor(editor, target, options) {
            // Move within same group because we do not support to show the same editor
            // multiple times in the same group
            if (this === target) {
                this.doMoveEditorInsideGroup(editor, options);
            }
            // Copy across groups
            else {
                this.doMoveOrCopyEditorAcrossGroups(editor, target, options, true);
            }
        }
        //#endregion
        //#region closeEditor()
        async closeEditor(editor = this.activeEditor || undefined, options) {
            await this.doCloseEditorWithDirtyHandling(editor, options);
        }
        async doCloseEditorWithDirtyHandling(editor = this.activeEditor || undefined, options) {
            if (!editor) {
                return false;
            }
            // Check for dirty and veto
            const veto = await this.handleDirtyClosing([editor]);
            if (veto) {
                return false;
            }
            // Do close
            this.doCloseEditor(editor, (options === null || options === void 0 ? void 0 : options.preserveFocus) ? false : undefined);
            return true;
        }
        doCloseEditor(editor, focusNext = (this.accessor.activeGroup === this), fromError) {
            // Closing the active editor of the group is a bit more work
            if (this.model.isActive(editor)) {
                this.doCloseActiveEditor(focusNext, fromError);
            }
            // Closing inactive editor is just a model update
            else {
                this.doCloseInactiveEditor(editor);
            }
            // Forward to title control
            this.titleAreaControl.closeEditor(editor);
        }
        doCloseActiveEditor(focusNext = (this.accessor.activeGroup === this), fromError) {
            const editorToClose = this.activeEditor;
            const restoreFocus = this.shouldRestoreFocus(this.element);
            // Optimization: if we are about to close the last editor in this group and settings
            // are configured to close the group since it will be empty, we first set the last
            // active group as empty before closing the editor. This reduces the amount of editor
            // change events that this operation emits and will reduce flicker. Without this
            // optimization, this group (if active) would first trigger a active editor change
            // event because it became empty, only to then trigger another one when the next
            // group gets active.
            const closeEmptyGroup = this.accessor.partOptions.closeEmptyGroups;
            if (closeEmptyGroup && this.active && this.model.count === 1) {
                const mostRecentlyActiveGroups = this.accessor.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
                const nextActiveGroup = mostRecentlyActiveGroups[1]; // [0] will be the current one, so take [1]
                if (nextActiveGroup) {
                    if (restoreFocus) {
                        nextActiveGroup.focus();
                    }
                    else {
                        this.accessor.activateGroup(nextActiveGroup);
                    }
                }
            }
            // Update model
            if (editorToClose) {
                this.model.closeEditor(editorToClose);
            }
            // Open next active if there are more to show
            const nextActiveEditor = this.model.activeEditor;
            if (nextActiveEditor) {
                const preserveFocus = !focusNext;
                let activation = undefined;
                if (preserveFocus && this.accessor.activeGroup !== this) {
                    // If we are opening the next editor in an inactive group
                    // without focussing it, ensure we preserve the editor
                    // group sizes in case that group is minimized.
                    // https://github.com/microsoft/vscode/issues/117686
                    activation = editor_3.EditorActivation.PRESERVE;
                }
                const options = editor_1.EditorOptions.create({ preserveFocus, activation });
                // When closing an editor due to an error we can end up in a loop where we continue closing
                // editors that fail to open (e.g. when the file no longer exists). We do not want to show
                // repeated errors in this case to the user. As such, if we open the next editor and we are
                // in a scope of a previous editor failing, we silence the input errors until the editor is
                // opened by setting ignoreError: true.
                if (fromError) {
                    options.ignoreError = true;
                }
                this.openEditor(nextActiveEditor, options);
            }
            // Otherwise we are empty, so clear from editor control and send event
            else {
                // Forward to editor control
                if (editorToClose) {
                    this.editorControl.closeEditor(editorToClose);
                }
                // Restore focus to group container as needed unless group gets closed
                if (restoreFocus && !closeEmptyGroup) {
                    this.focus();
                }
                // Events
                this._onDidGroupChange.fire({ kind: 5 /* EDITOR_ACTIVE */ });
                // Remove empty group if we should
                if (closeEmptyGroup) {
                    this.accessor.removeGroup(this);
                }
            }
        }
        shouldRestoreFocus(target) {
            const activeElement = document.activeElement;
            if (activeElement === document.body) {
                return true; // always restore focus if nothing is focused currently
            }
            // otherwise check for the active element being an ancestor of the target
            return (0, dom_1.isAncestor)(activeElement, target);
        }
        doCloseInactiveEditor(editor) {
            // Update model
            this.model.closeEditor(editor);
        }
        async handleDirtyClosing(editors) {
            if (!editors.length) {
                return false; // no veto
            }
            const editor = editors.shift();
            // To prevent multiple confirmation dialogs from showing up one after the other
            // we check if a pending confirmation is currently showing and if so, join that
            let handleDirtyClosingPromise = this.mapEditorToPendingConfirmation.get(editor);
            if (!handleDirtyClosingPromise) {
                handleDirtyClosingPromise = this.doHandleDirtyClosing(editor);
                this.mapEditorToPendingConfirmation.set(editor, handleDirtyClosingPromise);
            }
            let veto;
            try {
                veto = await handleDirtyClosingPromise;
            }
            finally {
                this.mapEditorToPendingConfirmation.delete(editor);
            }
            // Return for the first veto we got
            if (veto) {
                return veto;
            }
            // Otherwise continue with the remainders
            return this.handleDirtyClosing(editors);
        }
        async doHandleDirtyClosing(editor, options) {
            if (!editor.isDirty() || editor.isSaving()) {
                return false; // editor must be dirty and not saving
            }
            if (editor instanceof editor_1.SideBySideEditorInput && this.model.contains(editor.primary)) {
                return false; // primary-side of editor is still opened somewhere else
            }
            // Note: we explicitly decide to ask for confirm if closing a normal editor even
            // if it is opened in a side-by-side editor in the group. This decision is made
            // because it may be less obvious that one side of a side by side editor is dirty
            // and can still be changed.
            if (this.accessor.groups.some(groupView => {
                if (groupView === this) {
                    return false; // skip this group to avoid false assumptions about the editor being opened still
                }
                const otherGroup = groupView;
                if (otherGroup.contains(editor)) {
                    return true; // exact editor still opened
                }
                if (editor instanceof editor_1.SideBySideEditorInput && otherGroup.contains(editor.primary)) {
                    return true; // primary side of side by side editor still opened
                }
                return false;
            })) {
                return false; // editor is still editable somewhere else
            }
            // Auto-save on focus change: assume to Save unless the editor is untitled
            // because bringing up a dialog would save in this case anyway.
            // However, make sure to respect `skipAutoSave` option in case the automated
            // save fails which would result in the editor never closing
            // (see https://github.com/microsoft/vscode/issues/108752)
            let confirmation;
            let saveReason = 1 /* EXPLICIT */;
            let autoSave = false;
            if (this.filesConfigurationService.getAutoSaveMode() === 3 /* ON_FOCUS_CHANGE */ && !editor.isUntitled() && !(options === null || options === void 0 ? void 0 : options.skipAutoSave)) {
                autoSave = true;
                confirmation = 0 /* SAVE */;
                saveReason = 3 /* FOCUS_CHANGE */;
            }
            // No auto-save on focus change: ask user
            else {
                // Switch to editor that we want to handle and confirm to save/revert
                await this.openEditor(editor);
                let name;
                if (editor instanceof editor_1.SideBySideEditorInput) {
                    name = editor.primary.getName(); // prefer shorter names by using primary's name in this case
                }
                else {
                    name = editor.getName();
                }
                confirmation = await this.fileDialogService.showSaveConfirm([name]);
            }
            // It could be that the editor saved meanwhile or is saving, so we check
            // again to see if anything needs to happen before closing for good.
            // This can happen for example if autoSave: onFocusChange is configured
            // so that the save happens when the dialog opens.
            if (!editor.isDirty() || editor.isSaving()) {
                return confirmation === 2 /* CANCEL */ ? true : false;
            }
            // Otherwise, handle accordingly
            switch (confirmation) {
                case 0 /* SAVE */:
                    const result = await editor.save(this.id, { reason: saveReason });
                    if (!result && autoSave) {
                        // Save failed and we need to signal this back to the user, so
                        // we handle the dirty editor again but this time ensuring to
                        // show the confirm dialog
                        // (see https://github.com/microsoft/vscode/issues/108752)
                        return this.doHandleDirtyClosing(editor, { skipAutoSave: true });
                    }
                    return editor.isDirty(); // veto if still dirty
                case 1 /* DONT_SAVE */:
                    try {
                        // first try a normal revert where the contents of the editor are restored
                        await editor.revert(this.id);
                        return editor.isDirty(); // veto if still dirty
                    }
                    catch (error) {
                        // if that fails, since we are about to close the editor, we accept that
                        // the editor cannot be reverted and instead do a soft revert that just
                        // enables us to close the editor. With this, a user can always close a
                        // dirty editor even when reverting fails.
                        await editor.revert(this.id, { soft: true });
                        return editor.isDirty(); // veto if still dirty
                    }
                case 2 /* CANCEL */:
                    return true; // veto
            }
        }
        //#endregion
        //#region closeEditors()
        async closeEditors(args, options) {
            if (this.isEmpty) {
                return;
            }
            const editors = this.doGetEditorsToClose(args);
            // Check for dirty and veto
            const veto = await this.handleDirtyClosing(editors.slice(0));
            if (veto) {
                return;
            }
            // Do close
            this.doCloseEditors(editors, options);
        }
        doGetEditorsToClose(args) {
            if (Array.isArray(args)) {
                return args;
            }
            const filter = args;
            const hasDirection = typeof filter.direction === 'number';
            let editorsToClose = this.model.getEditors(hasDirection ? 1 /* SEQUENTIAL */ : 0 /* MOST_RECENTLY_ACTIVE */, filter); // in MRU order only if direction is not specified
            // Filter: saved or saving only
            if (filter.savedOnly) {
                editorsToClose = editorsToClose.filter(editor => !editor.isDirty() || editor.isSaving());
            }
            // Filter: direction (left / right)
            else if (hasDirection && filter.except) {
                editorsToClose = (filter.direction === 0 /* LEFT */) ?
                    editorsToClose.slice(0, this.model.indexOf(filter.except, editorsToClose)) :
                    editorsToClose.slice(this.model.indexOf(filter.except, editorsToClose) + 1);
            }
            // Filter: except
            else if (filter.except) {
                editorsToClose = editorsToClose.filter(editor => !editor.matches(filter.except));
            }
            return editorsToClose;
        }
        doCloseEditors(editors, options) {
            // Close all inactive editors first
            let closeActiveEditor = false;
            for (const editor of editors) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                else {
                    closeActiveEditor = true;
                }
            }
            // Close active editor last if contained in editors list to close
            if (closeActiveEditor) {
                this.doCloseActiveEditor((options === null || options === void 0 ? void 0 : options.preserveFocus) ? false : undefined);
            }
            // Forward to title control
            if (editors.length) {
                this.titleAreaControl.closeEditors(editors);
            }
        }
        //#endregion
        //#region closeAllEditors()
        async closeAllEditors(options) {
            if (this.isEmpty) {
                // If the group is empty and the request is to close all editors, we still close
                // the editor group is the related setting to close empty groups is enabled for
                // a convenient way of removing empty editor groups for the user.
                if (this.accessor.partOptions.closeEmptyGroups) {
                    this.accessor.removeGroup(this);
                }
                return;
            }
            // Check for dirty and veto
            const veto = await this.handleDirtyClosing(this.model.getEditors(0 /* MOST_RECENTLY_ACTIVE */, options));
            if (veto) {
                return;
            }
            // Do close
            this.doCloseAllEditors(options);
        }
        doCloseAllEditors(options) {
            // Close all inactive editors first
            const editorsToClose = [];
            for (const editor of this.model.getEditors(1 /* SEQUENTIAL */, options)) {
                if (!this.isActive(editor)) {
                    this.doCloseInactiveEditor(editor);
                }
                editorsToClose.push(editor);
            }
            // Close active editor last (unless we skip it, e.g. because it is sticky)
            if (this.activeEditor && editorsToClose.includes(this.activeEditor)) {
                this.doCloseActiveEditor();
            }
            // Forward to title control
            if (editorsToClose.length) {
                this.titleAreaControl.closeEditors(editorsToClose);
            }
        }
        //#endregion
        //#region replaceEditors()
        async replaceEditors(editors) {
            var _a;
            // Extract active vs. inactive replacements
            let activeReplacement;
            const inactiveReplacements = [];
            for (let { editor, replacement, forceReplaceDirty, options } of editors) {
                const index = this.getIndexOfEditor(editor);
                if (index >= 0) {
                    const isActiveEditor = this.isActive(editor);
                    // make sure we respect the index of the editor to replace
                    if (options) {
                        options.index = index;
                    }
                    else {
                        options = editor_1.EditorOptions.create({ index });
                    }
                    options.inactive = !isActiveEditor;
                    options.pinned = (_a = options.pinned) !== null && _a !== void 0 ? _a : true; // unless specified, prefer to pin upon replace
                    const editorToReplace = { editor, replacement, forceReplaceDirty, options };
                    if (isActiveEditor) {
                        activeReplacement = editorToReplace;
                    }
                    else {
                        inactiveReplacements.push(editorToReplace);
                    }
                }
            }
            // Handle inactive first
            for (const { editor, replacement, forceReplaceDirty, options } of inactiveReplacements) {
                // Open inactive editor
                await this.doOpenEditor(replacement, options);
                // Close replaced inactive editor unless they match
                if (!editor.matches(replacement)) {
                    let closed = false;
                    if (forceReplaceDirty) {
                        this.doCloseEditor(editor, false);
                        closed = true;
                    }
                    else {
                        closed = await this.doCloseEditorWithDirtyHandling(editor, { preserveFocus: true });
                    }
                    if (!closed) {
                        return; // canceled
                    }
                }
            }
            // Handle active last
            if (activeReplacement) {
                // Open replacement as active editor
                const openEditorResult = this.doOpenEditor(activeReplacement.replacement, activeReplacement.options);
                // Close replaced active editor unless they match
                if (!activeReplacement.editor.matches(activeReplacement.replacement)) {
                    if (activeReplacement.forceReplaceDirty) {
                        this.doCloseEditor(activeReplacement.editor, false);
                    }
                    else {
                        await this.doCloseEditorWithDirtyHandling(activeReplacement.editor, { preserveFocus: true });
                    }
                }
                await openEditorResult;
            }
        }
        //#endregion
        //#region Themable
        updateStyles() {
            const isEmpty = this.isEmpty;
            // Container
            if (isEmpty) {
                this.element.style.backgroundColor = this.getColor(theme_1.EDITOR_GROUP_EMPTY_BACKGROUND) || '';
            }
            else {
                this.element.style.backgroundColor = '';
            }
            // Title control
            const borderColor = this.getColor(theme_1.EDITOR_GROUP_HEADER_BORDER) || this.getColor(colorRegistry_1.contrastBorder);
            if (!isEmpty && borderColor) {
                this.titleContainer.classList.add('title-border-bottom');
                this.titleContainer.style.setProperty('--title-border-bottom-color', borderColor.toString());
            }
            else {
                this.titleContainer.classList.remove('title-border-bottom');
                this.titleContainer.style.removeProperty('--title-border-bottom-color');
            }
            const { showTabs } = this.accessor.partOptions;
            this.titleContainer.style.backgroundColor = this.getColor(showTabs ? theme_1.EDITOR_GROUP_HEADER_TABS_BACKGROUND : theme_1.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND) || '';
            // Editor container
            this.editorContainer.style.backgroundColor = this.getColor(colorRegistry_1.editorBackground) || '';
        }
        get minimumWidth() { return this.editorControl.minimumWidth; }
        get minimumHeight() { return this.editorControl.minimumHeight; }
        get maximumWidth() { return this.editorControl.maximumWidth; }
        get maximumHeight() { return this.editorControl.maximumHeight; }
        layout(width, height) {
            this.dimension = new dom_1.Dimension(width, height);
            // Layout the title area first to receive the size it occupies
            const titleAreaSize = this.titleAreaControl.layout({
                container: this.dimension,
                available: new dom_1.Dimension(width, height - this.editorControl.minimumHeight)
            });
            // Pass the container width and remaining height to the editor layout
            const editorHeight = Math.max(0, height - titleAreaSize.height);
            this.editorContainer.style.height = `${editorHeight}px`;
            this.editorControl.layout(new dom_1.Dimension(width, editorHeight));
        }
        relayout() {
            if (this.dimension) {
                const { width, height } = this.dimension;
                this.layout(width, height);
            }
        }
        toJSON() {
            return this.model.serialize();
        }
        //#endregion
        dispose() {
            this._disposed = true;
            this._onWillDispose.fire();
            this.titleAreaControl.dispose();
            super.dispose();
        }
    };
    EditorGroupView = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, themeService_1.IThemeService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, actions_2.IMenuService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, dialogs_1.IFileDialogService),
        __param(13, log_1.ILogService),
        __param(14, editorService_1.IEditorService),
        __param(15, filesConfigurationService_1.IFilesConfigurationService),
        __param(16, uriIdentity_1.IUriIdentityService)
    ], EditorGroupView);
    exports.EditorGroupView = EditorGroupView;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Letterpress
        const letterpress = `./media/letterpress${theme.type === 'dark' ? '-dark' : theme.type === 'hc' ? '-hc' : ''}.svg`;
        collector.addRule(`
		.monaco-workbench .part.editor > .content .editor-group-container.empty .editor-group-letterpress {
			background-image: ${(0, dom_1.asCSSUrl)(network_1.FileAccess.asBrowserUri(letterpress, require))}
		}
	`);
        // Focused Empty Group Border
        const focusedEmptyGroupBorder = theme.getColor(theme_1.EDITOR_GROUP_FOCUSED_EMPTY_BORDER);
        if (focusedEmptyGroupBorder) {
            collector.addRule(`
			.monaco-workbench .part.editor > .content:not(.empty) .editor-group-container.empty.active:focus {
				outline-width: 1px;
				outline-color: ${focusedEmptyGroupBorder};
				outline-offset: -2px;
				outline-style: solid;
			}

			.monaco-workbench .part.editor > .content.empty .editor-group-container.empty.active:focus {
				outline: none; /* never show outline for empty group if it is the last */
			}
		`);
        }
        else {
            collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.empty.active:focus {
				outline: none; /* disable focus outline unless active empty group border is defined */
			}
		`);
        }
    });
});
//# sourceMappingURL=editorGroupView.js.map