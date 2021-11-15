/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/editor", "vs/base/common/event", "vs/base/common/types", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls_1, event_1, types_1, uri_1, lifecycle_1, instantiation_1, contextkey_1, platform_1, actions_1, arrays_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorGroupToViewColumn = exports.viewColumnToEditorGroup = exports.EditorsOrder = exports.pathsToEditors = exports.CloseDirection = exports.EditorResourceAccessor = exports.SideBySideEditor = exports.EditorCommandsContextActionRunner = exports.TextEditorOptions = exports.EditorOptions = exports.isEditorInputWithOptions = exports.EditorModel = exports.SideBySideEditorInput = exports.isEditorInputWithPreferredResource = exports.EditorInput = exports.SaveReason = exports.Verbosity = exports.isTextEditorPane = exports.BINARY_DIFF_EDITOR_ID = exports.TEXT_DIFF_EDITOR_ID = exports.EditorAreaVisibleContext = exports.SplitEditorsVertically = exports.IsCenteredLayoutContext = exports.InEditorZenModeContext = exports.EditorsVisibleContext = exports.SingleEditorGroupsContext = exports.MultipleEditorGroupsContext = exports.ActiveEditorGroupLastContext = exports.ActiveEditorGroupIndexContext = exports.ActiveEditorGroupEmptyContext = exports.EditorGroupEditorsCountContext = exports.TextCompareEditorActiveContext = exports.TextCompareEditorVisibleContext = exports.ActiveEditorAvailableEditorIdsContext = exports.ActiveEditorContext = exports.ActiveEditorReadonlyContext = exports.ActiveEditorStickyContext = exports.ActiveEditorPinnedContext = exports.ActiveEditorDirtyContext = exports.EditorExtensions = void 0;
    // Static values for editor contributions
    exports.EditorExtensions = {
        Editors: 'workbench.contributions.editors',
        Associations: 'workbench.editors.associations',
        EditorInputFactories: 'workbench.contributions.editor.inputFactories'
    };
    // Editor State Context Keys
    exports.ActiveEditorDirtyContext = new contextkey_1.RawContextKey('activeEditorIsDirty', false, (0, nls_1.localize)(0, null));
    exports.ActiveEditorPinnedContext = new contextkey_1.RawContextKey('activeEditorIsNotPreview', false, (0, nls_1.localize)(1, null));
    exports.ActiveEditorStickyContext = new contextkey_1.RawContextKey('activeEditorIsPinned', false, (0, nls_1.localize)(2, null));
    exports.ActiveEditorReadonlyContext = new contextkey_1.RawContextKey('activeEditorIsReadonly', false, (0, nls_1.localize)(3, null));
    // Editor Kind Context Keys
    exports.ActiveEditorContext = new contextkey_1.RawContextKey('activeEditor', null, { type: 'string', description: (0, nls_1.localize)(4, null) });
    exports.ActiveEditorAvailableEditorIdsContext = new contextkey_1.RawContextKey('activeEditorAvailableEditorIds', '', (0, nls_1.localize)(5, null));
    exports.TextCompareEditorVisibleContext = new contextkey_1.RawContextKey('textCompareEditorVisible', false, (0, nls_1.localize)(6, null));
    exports.TextCompareEditorActiveContext = new contextkey_1.RawContextKey('textCompareEditorActive', false, (0, nls_1.localize)(7, null));
    // Editor Group Context Keys
    exports.EditorGroupEditorsCountContext = new contextkey_1.RawContextKey('groupEditorsCount', 0, (0, nls_1.localize)(8, null));
    exports.ActiveEditorGroupEmptyContext = new contextkey_1.RawContextKey('activeEditorGroupEmpty', false, (0, nls_1.localize)(9, null));
    exports.ActiveEditorGroupIndexContext = new contextkey_1.RawContextKey('activeEditorGroupIndex', 0, (0, nls_1.localize)(10, null));
    exports.ActiveEditorGroupLastContext = new contextkey_1.RawContextKey('activeEditorGroupLast', false, (0, nls_1.localize)(11, null));
    exports.MultipleEditorGroupsContext = new contextkey_1.RawContextKey('multipleEditorGroups', false, (0, nls_1.localize)(12, null));
    exports.SingleEditorGroupsContext = exports.MultipleEditorGroupsContext.toNegated();
    // Editor Layout Context Keys
    exports.EditorsVisibleContext = new contextkey_1.RawContextKey('editorIsOpen', false, (0, nls_1.localize)(13, null));
    exports.InEditorZenModeContext = new contextkey_1.RawContextKey('inZenMode', false, (0, nls_1.localize)(14, null));
    exports.IsCenteredLayoutContext = new contextkey_1.RawContextKey('isCenteredLayout', false, (0, nls_1.localize)(15, null));
    exports.SplitEditorsVertically = new contextkey_1.RawContextKey('splitEditorsVertically', false, (0, nls_1.localize)(16, null));
    exports.EditorAreaVisibleContext = new contextkey_1.RawContextKey('editorAreaVisible', true, (0, nls_1.localize)(17, null));
    /**
     * Text diff editor id.
     */
    exports.TEXT_DIFF_EDITOR_ID = 'workbench.editors.textDiffEditor';
    /**
     * Binary diff editor id.
     */
    exports.BINARY_DIFF_EDITOR_ID = 'workbench.editors.binaryResourceDiffEditor';
    function isTextEditorPane(thing) {
        const candidate = thing;
        return typeof (candidate === null || candidate === void 0 ? void 0 : candidate.getViewState) === 'function';
    }
    exports.isTextEditorPane = isTextEditorPane;
    var Verbosity;
    (function (Verbosity) {
        Verbosity[Verbosity["SHORT"] = 0] = "SHORT";
        Verbosity[Verbosity["MEDIUM"] = 1] = "MEDIUM";
        Verbosity[Verbosity["LONG"] = 2] = "LONG";
    })(Verbosity = exports.Verbosity || (exports.Verbosity = {}));
    var SaveReason;
    (function (SaveReason) {
        /**
         * Explicit user gesture.
         */
        SaveReason[SaveReason["EXPLICIT"] = 1] = "EXPLICIT";
        /**
         * Auto save after a timeout.
         */
        SaveReason[SaveReason["AUTO"] = 2] = "AUTO";
        /**
         * Auto save after editor focus change.
         */
        SaveReason[SaveReason["FOCUS_CHANGE"] = 3] = "FOCUS_CHANGE";
        /**
         * Auto save after window change.
         */
        SaveReason[SaveReason["WINDOW_CHANGE"] = 4] = "WINDOW_CHANGE";
    })(SaveReason = exports.SaveReason || (exports.SaveReason = {}));
    /**
     * Editor inputs are lightweight objects that can be passed to the workbench API to open inside the editor part.
     * Each editor input is mapped to an editor that is capable of opening it through the Platform facade.
     */
    class EditorInput extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeLabel = this._register(new event_1.Emitter());
            this.onDidChangeLabel = this._onDidChangeLabel.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.disposed = false;
        }
        getName() {
            return `Editor ${this.typeId}`;
        }
        getDescription(verbosity) {
            return undefined;
        }
        getTitle(verbosity) {
            return this.getName();
        }
        getAriaLabel() {
            return this.getTitle(0 /* SHORT */);
        }
        /**
         * Returns the preferred editor for this input. A list of candidate editors is passed in that whee registered
         * for the input. This allows subclasses to decide late which editor to use for the input on a case by case basis.
         */
        getPreferredEditorId(candidates) {
            return (0, arrays_1.firstOrDefault)(candidates);
        }
        /**
        * Returns a descriptor suitable for telemetry events.
        *
        * Subclasses should extend if they can contribute.
        */
        getTelemetryDescriptor() {
            /* __GDPR__FRAGMENT__
                "EditorTelemetryDescriptor" : {
                    "typeId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            return { typeId: this.typeId };
        }
        isReadonly() {
            return true;
        }
        isUntitled() {
            return false;
        }
        isDirty() {
            return false;
        }
        isSaving() {
            return false;
        }
        async resolve() {
            return null;
        }
        async save(group, options) {
            return this;
        }
        async saveAs(group, options) {
            return this;
        }
        async revert(group, options) { }
        rename(group, target) {
            return undefined;
        }
        canSplit() {
            return true;
        }
        matches(otherInput) {
            return this === otherInput;
        }
        copy() {
            return this;
        }
        isDisposed() {
            return this.disposed;
        }
        dispose() {
            if (!this.disposed) {
                this.disposed = true;
                this._onWillDispose.fire();
            }
            super.dispose();
        }
    }
    exports.EditorInput = EditorInput;
    function isEditorInputWithPreferredResource(obj) {
        const editorInputWithPreferredResource = obj;
        return editorInputWithPreferredResource && !!editorInputWithPreferredResource.preferredResource;
    }
    exports.isEditorInputWithPreferredResource = isEditorInputWithPreferredResource;
    /**
     * Side by side editor inputs that have a primary and secondary side.
     */
    class SideBySideEditorInput extends EditorInput {
        constructor(name, description, _secondary, _primary) {
            super();
            this.name = name;
            this.description = description;
            this._secondary = _secondary;
            this._primary = _primary;
            this.registerListeners();
        }
        get typeId() {
            return SideBySideEditorInput.ID;
        }
        registerListeners() {
            // When the primary or secondary input gets disposed, dispose this diff editor input
            const onceSecondaryDisposed = event_1.Event.once(this.secondary.onWillDispose);
            this._register(onceSecondaryDisposed(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            const oncePrimaryDisposed = event_1.Event.once(this.primary.onWillDispose);
            this._register(oncePrimaryDisposed(() => {
                if (!this.isDisposed()) {
                    this.dispose();
                }
            }));
            // Reemit some events from the primary side to the outside
            this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
        }
        /**
         * Use `EditorResourceAccessor` utility method to access the resources
         * of both sides of the diff editor.
         */
        get resource() {
            return undefined;
        }
        get primary() {
            return this._primary;
        }
        get secondary() {
            return this._secondary;
        }
        getName() {
            if (!this.name) {
                return (0, nls_1.localize)(18, null, this._secondary.getName(), this._primary.getName());
            }
            return this.name;
        }
        getDescription() {
            return this.description;
        }
        isReadonly() {
            return this.primary.isReadonly();
        }
        isUntitled() {
            return this.primary.isUntitled();
        }
        isDirty() {
            return this.primary.isDirty();
        }
        isSaving() {
            return this.primary.isSaving();
        }
        save(group, options) {
            return this.primary.save(group, options);
        }
        saveAs(group, options) {
            return this.primary.saveAs(group, options);
        }
        revert(group, options) {
            return this.primary.revert(group, options);
        }
        getTelemetryDescriptor() {
            const descriptor = this.primary.getTelemetryDescriptor();
            return Object.assign(descriptor, super.getTelemetryDescriptor());
        }
        matches(otherInput) {
            if (otherInput === this) {
                return true;
            }
            if (otherInput instanceof SideBySideEditorInput) {
                return this.primary.matches(otherInput.primary) && this.secondary.matches(otherInput.secondary);
            }
            return false;
        }
    }
    exports.SideBySideEditorInput = SideBySideEditorInput;
    SideBySideEditorInput.ID = 'workbench.editorinputs.sidebysideEditorInput';
    /**
     * The editor model is the heavyweight counterpart of editor input. Depending on the editor input, it
     * resolves from a file system retrieve content and may allow for saving it back or reverting it.
     * Editor models are typically cached for some while because they are expensive to construct.
     */
    class EditorModel extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.disposed = false;
            this.resolved = false;
        }
        /**
         * Causes this model to resolve returning a promise when loading is completed.
         */
        async resolve() {
            this.resolved = true;
        }
        /**
         * Returns whether this model was loaded or not.
         */
        isResolved() {
            return this.resolved;
        }
        /**
         * Find out if this model has been disposed.
         */
        isDisposed() {
            return this.disposed;
        }
        /**
         * Subclasses should implement to free resources that have been claimed through loading.
         */
        dispose() {
            this.disposed = true;
            this._onWillDispose.fire();
            super.dispose();
        }
    }
    exports.EditorModel = EditorModel;
    function isEditorInputWithOptions(obj) {
        const editorInputWithOptions = obj;
        return !!editorInputWithOptions && !!editorInputWithOptions.editor;
    }
    exports.isEditorInputWithOptions = isEditorInputWithOptions;
    /**
     * The editor options is the base class of options that can be passed in when opening an editor.
     */
    class EditorOptions {
        /**
         * Helper to create EditorOptions inline.
         */
        static create(settings) {
            const options = new EditorOptions();
            options.overwrite(settings);
            return options;
        }
        /**
         * Overwrites option values from the provided bag.
         */
        overwrite(options) {
            if (typeof options.forceReload === 'boolean') {
                this.forceReload = options.forceReload;
            }
            if (typeof options.revealIfVisible === 'boolean') {
                this.revealIfVisible = options.revealIfVisible;
            }
            if (typeof options.revealIfOpened === 'boolean') {
                this.revealIfOpened = options.revealIfOpened;
            }
            if (typeof options.preserveFocus === 'boolean') {
                this.preserveFocus = options.preserveFocus;
            }
            if (typeof options.activation === 'number') {
                this.activation = options.activation;
            }
            if (typeof options.pinned === 'boolean') {
                this.pinned = options.pinned;
            }
            if (typeof options.sticky === 'boolean') {
                this.sticky = options.sticky;
            }
            if (typeof options.inactive === 'boolean') {
                this.inactive = options.inactive;
            }
            if (typeof options.ignoreError === 'boolean') {
                this.ignoreError = options.ignoreError;
            }
            if (typeof options.index === 'number') {
                this.index = options.index;
            }
            if (options.override !== undefined) {
                this.override = options.override;
            }
            if (typeof options.context === 'number') {
                this.context = options.context;
            }
            return this;
        }
    }
    exports.EditorOptions = EditorOptions;
    /**
     * Base Text Editor Options.
     */
    class TextEditorOptions extends EditorOptions {
        static from(input) {
            if (!(input === null || input === void 0 ? void 0 : input.options)) {
                return undefined;
            }
            return TextEditorOptions.create(input.options);
        }
        /**
         * Helper to convert options bag to real class
         */
        static create(options = Object.create(null)) {
            const textEditorOptions = new TextEditorOptions();
            textEditorOptions.overwrite(options);
            return textEditorOptions;
        }
        /**
         * Overwrites option values from the provided bag.
         */
        overwrite(options) {
            var _a, _b;
            super.overwrite(options);
            if (options.selection) {
                this.selection = {
                    startLineNumber: options.selection.startLineNumber,
                    startColumn: options.selection.startColumn,
                    endLineNumber: (_a = options.selection.endLineNumber) !== null && _a !== void 0 ? _a : options.selection.startLineNumber,
                    endColumn: (_b = options.selection.endColumn) !== null && _b !== void 0 ? _b : options.selection.startColumn
                };
            }
            if (options.viewState) {
                this.editorViewState = options.viewState;
            }
            if (typeof options.selectionRevealType !== 'undefined') {
                this.selectionRevealType = options.selectionRevealType;
            }
            return this;
        }
        /**
         * Returns if this options object has objects defined for the editor.
         */
        hasOptionsDefined() {
            return !!this.editorViewState || !!this.selectionRevealType || !!this.selection;
        }
        /**
         * Create a TextEditorOptions inline to be used when the editor is opening.
         */
        static fromEditor(editor, settings) {
            const options = TextEditorOptions.create(settings);
            // View state
            options.editorViewState = (0, types_1.withNullAsUndefined)(editor.saveViewState());
            return options;
        }
        /**
         * Apply the view state or selection to the given editor.
         *
         * @return if something was applied
         */
        apply(editor, scrollType) {
            var _a, _b;
            let gotApplied = false;
            // First try viewstate
            if (this.editorViewState) {
                editor.restoreViewState(this.editorViewState);
                gotApplied = true;
            }
            // Otherwise check for selection
            else if (this.selection) {
                const range = {
                    startLineNumber: this.selection.startLineNumber,
                    startColumn: this.selection.startColumn,
                    endLineNumber: (_a = this.selection.endLineNumber) !== null && _a !== void 0 ? _a : this.selection.startLineNumber,
                    endColumn: (_b = this.selection.endColumn) !== null && _b !== void 0 ? _b : this.selection.startColumn
                };
                editor.setSelection(range);
                if (this.selectionRevealType === 2 /* NearTop */) {
                    editor.revealRangeNearTop(range, scrollType);
                }
                else if (this.selectionRevealType === 3 /* NearTopIfOutsideViewport */) {
                    editor.revealRangeNearTopIfOutsideViewport(range, scrollType);
                }
                else if (this.selectionRevealType === 1 /* CenterIfOutsideViewport */) {
                    editor.revealRangeInCenterIfOutsideViewport(range, scrollType);
                }
                else {
                    editor.revealRangeInCenter(range, scrollType);
                }
                gotApplied = true;
            }
            return gotApplied;
        }
    }
    exports.TextEditorOptions = TextEditorOptions;
    class EditorCommandsContextActionRunner extends actions_1.ActionRunner {
        constructor(context) {
            super();
            this.context = context;
        }
        run(action) {
            return super.run(action, this.context);
        }
    }
    exports.EditorCommandsContextActionRunner = EditorCommandsContextActionRunner;
    var SideBySideEditor;
    (function (SideBySideEditor) {
        SideBySideEditor[SideBySideEditor["PRIMARY"] = 1] = "PRIMARY";
        SideBySideEditor[SideBySideEditor["SECONDARY"] = 2] = "SECONDARY";
        SideBySideEditor[SideBySideEditor["BOTH"] = 3] = "BOTH";
    })(SideBySideEditor = exports.SideBySideEditor || (exports.SideBySideEditor = {}));
    class EditorResourceAccessorImpl {
        getOriginalUri(editor, options) {
            if (!editor) {
                return undefined;
            }
            // Optionally support side-by-side editors
            if ((options === null || options === void 0 ? void 0 : options.supportSideBySide) && editor instanceof SideBySideEditorInput) {
                if ((options === null || options === void 0 ? void 0 : options.supportSideBySide) === SideBySideEditor.BOTH) {
                    return {
                        primary: this.getOriginalUri(editor.primary, { filterByScheme: options.filterByScheme }),
                        secondary: this.getOriginalUri(editor.secondary, { filterByScheme: options.filterByScheme })
                    };
                }
                editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? editor.primary : editor.secondary;
            }
            // Original URI is the `preferredResource` of an editor if any
            const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
            if (!originalResource || !options || !options.filterByScheme) {
                return originalResource;
            }
            return this.filterUri(originalResource, options.filterByScheme);
        }
        getCanonicalUri(editor, options) {
            if (!editor) {
                return undefined;
            }
            // Optionally support side-by-side editors
            if ((options === null || options === void 0 ? void 0 : options.supportSideBySide) && editor instanceof SideBySideEditorInput) {
                if ((options === null || options === void 0 ? void 0 : options.supportSideBySide) === SideBySideEditor.BOTH) {
                    return {
                        primary: this.getCanonicalUri(editor.primary, { filterByScheme: options.filterByScheme }),
                        secondary: this.getCanonicalUri(editor.secondary, { filterByScheme: options.filterByScheme })
                    };
                }
                editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? editor.primary : editor.secondary;
            }
            // Canonical URI is the `resource` of an editor
            const canonicalResource = editor.resource;
            if (!canonicalResource || !options || !options.filterByScheme) {
                return canonicalResource;
            }
            return this.filterUri(canonicalResource, options.filterByScheme);
        }
        filterUri(resource, filter) {
            // Multiple scheme filter
            if (Array.isArray(filter)) {
                if (filter.some(scheme => resource.scheme === scheme)) {
                    return resource;
                }
            }
            // Single scheme filter
            else {
                if (filter === resource.scheme) {
                    return resource;
                }
            }
            return undefined;
        }
    }
    exports.EditorResourceAccessor = new EditorResourceAccessorImpl();
    var CloseDirection;
    (function (CloseDirection) {
        CloseDirection[CloseDirection["LEFT"] = 0] = "LEFT";
        CloseDirection[CloseDirection["RIGHT"] = 1] = "RIGHT";
    })(CloseDirection = exports.CloseDirection || (exports.CloseDirection = {}));
    class EditorInputFactoryRegistry {
        constructor() {
            this.customEditorInputFactoryInstances = new Map();
            this.editorInputSerializerConstructors = new Map();
            this.editorInputSerializerInstances = new Map();
        }
        start(accessor) {
            const instantiationService = this.instantiationService = accessor.get(instantiation_1.IInstantiationService);
            for (const [key, ctor] of this.editorInputSerializerConstructors) {
                this.createEditorInputSerializer(key, ctor, instantiationService);
            }
            this.editorInputSerializerConstructors.clear();
        }
        createEditorInputSerializer(editorInputTypeId, ctor, instantiationService) {
            const instance = instantiationService.createInstance(ctor);
            this.editorInputSerializerInstances.set(editorInputTypeId, instance);
        }
        registerFileEditorInputFactory(factory) {
            if (this.fileEditorInputFactory) {
                throw new Error('Can only register one file editor input factory.');
            }
            this.fileEditorInputFactory = factory;
        }
        getFileEditorInputFactory() {
            return (0, types_1.assertIsDefined)(this.fileEditorInputFactory);
        }
        registerEditorInputSerializer(editorInputTypeId, ctor) {
            if (this.editorInputSerializerConstructors.has(editorInputTypeId) || this.editorInputSerializerInstances.has(editorInputTypeId)) {
                throw new Error(`A editor input serializer with type ID '${editorInputTypeId}' was already registered.`);
            }
            if (!this.instantiationService) {
                this.editorInputSerializerConstructors.set(editorInputTypeId, ctor);
            }
            else {
                this.createEditorInputSerializer(editorInputTypeId, ctor, this.instantiationService);
            }
            return (0, lifecycle_1.toDisposable)(() => {
                this.editorInputSerializerConstructors.delete(editorInputTypeId);
                this.editorInputSerializerInstances.delete(editorInputTypeId);
            });
        }
        getEditorInputSerializer(arg1) {
            return this.editorInputSerializerInstances.get(typeof arg1 === 'string' ? arg1 : arg1.typeId);
        }
        registerCustomEditorInputFactory(scheme, factory) {
            this.customEditorInputFactoryInstances.set(scheme, factory);
        }
        getCustomEditorInputFactory(scheme) {
            return this.customEditorInputFactoryInstances.get(scheme);
        }
    }
    platform_1.Registry.add(exports.EditorExtensions.EditorInputFactories, new EditorInputFactoryRegistry());
    async function pathsToEditors(paths, fileService) {
        if (!paths || !paths.length) {
            return [];
        }
        const editors = await Promise.all(paths.map(async (path) => {
            const resource = uri_1.URI.revive(path.fileUri);
            if (!resource || !fileService.canHandleResource(resource)) {
                return;
            }
            const exists = (typeof path.exists === 'boolean') ? path.exists : await fileService.exists(resource);
            if (!exists && path.openOnlyIfExists) {
                return;
            }
            const options = (exists && typeof path.lineNumber === 'number') ? {
                selection: {
                    startLineNumber: path.lineNumber,
                    startColumn: path.columnNumber || 1
                },
                pinned: true,
                override: path.editorOverrideId
            } : {
                pinned: true,
                override: path.editorOverrideId
            };
            let input;
            if (!exists) {
                input = { resource, options, forceUntitled: true };
            }
            else {
                input = { resource, options, forceFile: true };
            }
            return input;
        }));
        return (0, arrays_1.coalesce)(editors);
    }
    exports.pathsToEditors = pathsToEditors;
    var EditorsOrder;
    (function (EditorsOrder) {
        /**
         * Editors sorted by most recent activity (most recent active first)
         */
        EditorsOrder[EditorsOrder["MOST_RECENTLY_ACTIVE"] = 0] = "MOST_RECENTLY_ACTIVE";
        /**
         * Editors sorted by sequential order
         */
        EditorsOrder[EditorsOrder["SEQUENTIAL"] = 1] = "SEQUENTIAL";
    })(EditorsOrder = exports.EditorsOrder || (exports.EditorsOrder = {}));
    function viewColumnToEditorGroup(editorGroupService, viewColumn) {
        if (typeof viewColumn !== 'number' || viewColumn === editorService_1.ACTIVE_GROUP) {
            return editorService_1.ACTIVE_GROUP; // prefer active group when position is undefined or passed in as such
        }
        const groups = editorGroupService.getGroups(2 /* GRID_APPEARANCE */);
        let candidateGroup = groups[viewColumn];
        if (candidateGroup) {
            return candidateGroup.id; // found direct match
        }
        let firstGroup = groups[0];
        if (groups.length === 1 && firstGroup.count === 0) {
            return firstGroup.id; // first editor should always open in first group independent from position provided
        }
        return editorService_1.SIDE_GROUP; // open to the side if group not found or we are instructed to
    }
    exports.viewColumnToEditorGroup = viewColumnToEditorGroup;
    function editorGroupToViewColumn(editorGroupService, editorGroup) {
        let group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
        group = group !== null && group !== void 0 ? group : editorGroupService.activeGroup;
        return editorGroupService.getGroups(2 /* GRID_APPEARANCE */).indexOf(group);
    }
    exports.editorGroupToViewColumn = editorGroupToViewColumn;
});
//# sourceMappingURL=editor.js.map