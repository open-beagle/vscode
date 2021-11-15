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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/registry/common/platform", "vs/base/common/map", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/files/common/files", "vs/base/common/network", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/resources", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/extensions", "vs/base/common/types", "vs/workbench/browser/parts/editor/editorsObserver", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/async", "vs/platform/workspace/common/workspace", "vs/base/common/extpath", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/editor/common/services/modelService", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorOverrideService"], function (require, exports, instantiation_1, editor_1, editor_2, resourceEditorInput_1, platform_1, map_1, untitledTextEditorService_1, files_1, network_1, event_1, uri_1, resources_1, diffEditorInput_1, editorGroupsService_1, editorService_1, configuration_1, lifecycle_1, arrays_1, editorBrowser_1, extensions_1, types_1, editorsObserver_1, untitledTextEditorInput_1, async_1, workspace_1, extpath_1, uriIdentity_1, modelService_1, log_1, editorOverrideService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatingEditorService = exports.EditorService = void 0;
    let EditorService = class EditorService extends lifecycle_1.Disposable {
        constructor(editorGroupService, untitledTextEditorService, instantiationService, fileService, configurationService, contextService, uriIdentityService, logService, editorOverrideService) {
            super();
            this.editorGroupService = editorGroupService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.instantiationService = instantiationService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.contextService = contextService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this.editorOverrideService = editorOverrideService;
            //#region events
            this._onDidActiveEditorChange = this._register(new event_1.Emitter());
            this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
            this._onDidVisibleEditorsChange = this._register(new event_1.Emitter());
            this.onDidVisibleEditorsChange = this._onDidVisibleEditorsChange.event;
            this._onDidCloseEditor = this._register(new event_1.Emitter());
            this.onDidCloseEditor = this._onDidCloseEditor.event;
            this._onDidOpenEditorFail = this._register(new event_1.Emitter());
            this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
            this._onDidMostRecentlyActiveEditorsChange = this._register(new event_1.Emitter());
            this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
            //#endregion
            this.fileEditorInputFactory = platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).getFileEditorInputFactory();
            //#region Editor & group event handlers
            this.lastActiveEditor = undefined;
            //#endregion
            //#region Visible Editors Change: Install file watchers for out of workspace resources that became visible
            this.activeOutOfWorkspaceWatchers = new map_1.ResourceMap();
            this.closeOnFileDelete = false;
            //#endregion
            //#region Editor accessors
            this.editorsObserver = this._register(this.instantiationService.createInstance(editorsObserver_1.EditorsObserver));
            //#endregion
            //#region editor overrides
            this.openEditorOverrides = [];
            //#endregion
            //#region createEditorInput()
            this.editorInputCache = new map_1.ResourceMap();
            this._modelService = undefined;
            this.onConfigurationUpdated(configurationService.getValue());
            this.registerListeners();
            // Register the default editor to the override service
            // so that it shows up in the editors picker
            this.registerDefaultOverride();
        }
        registerListeners() {
            // Editor & group changes
            this.editorGroupService.whenReady.then(() => this.onEditorGroupsReady());
            this.editorGroupService.onDidChangeActiveGroup(group => this.handleActiveEditorChange(group));
            this.editorGroupService.onDidAddGroup(group => this.registerGroupListeners(group));
            this.editorsObserver.onDidMostRecentlyActiveEditorsChange(() => this._onDidMostRecentlyActiveEditorsChange.fire());
            // Out of workspace file watchers
            this._register(this.onDidVisibleEditorsChange(() => this.handleVisibleEditorsChange()));
            // File changes & operations
            // Note: there is some duplication with the two file event handlers- Since we cannot always rely on the disk events
            // carrying all necessary data in all environments, we also use the file operation events to make sure operations are handled.
            // In any case there is no guarantee if the local event is fired first or the disk one. Thus, code must handle the case
            // that the event ordering is random as well as might not carry all information needed.
            this._register(this.fileService.onDidRunOperation(e => this.onDidRunFileOperation(e)));
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // Configuration
            this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(this.configurationService.getValue())));
        }
        onEditorGroupsReady() {
            // Register listeners to each opened group
            for (const group of this.editorGroupService.groups) {
                this.registerGroupListeners(group);
            }
            // Fire initial set of editor events if there is an active editor
            if (this.activeEditor) {
                this.doHandleActiveEditorChangeEvent();
                this._onDidVisibleEditorsChange.fire();
            }
        }
        handleActiveEditorChange(group) {
            if (group !== this.editorGroupService.activeGroup) {
                return; // ignore if not the active group
            }
            if (!this.lastActiveEditor && !group.activeEditor) {
                return; // ignore if we still have no active editor
            }
            this.doHandleActiveEditorChangeEvent();
        }
        doHandleActiveEditorChangeEvent() {
            // Remember as last active
            const activeGroup = this.editorGroupService.activeGroup;
            this.lastActiveEditor = (0, types_1.withNullAsUndefined)(activeGroup.activeEditor);
            // Fire event to outside parties
            this._onDidActiveEditorChange.fire();
        }
        registerGroupListeners(group) {
            const groupDisposables = new lifecycle_1.DisposableStore();
            groupDisposables.add(group.onDidGroupChange(e => {
                if (e.kind === 5 /* EDITOR_ACTIVE */) {
                    this.handleActiveEditorChange(group);
                    this._onDidVisibleEditorsChange.fire();
                }
            }));
            groupDisposables.add(group.onDidCloseEditor(event => {
                this._onDidCloseEditor.fire(event);
            }));
            groupDisposables.add(group.onDidOpenEditorFail(editor => {
                this._onDidOpenEditorFail.fire({ editor, groupId: group.id });
            }));
            event_1.Event.once(group.onWillDispose)(() => {
                (0, lifecycle_1.dispose)(groupDisposables);
            });
        }
        handleVisibleEditorsChange() {
            const visibleOutOfWorkspaceResources = new map_1.ResourceMap();
            for (const editor of this.visibleEditors) {
                const resources = (0, arrays_1.distinct)((0, arrays_1.coalesce)([
                    editor_2.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.PRIMARY }),
                    editor_2.EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: editor_2.SideBySideEditor.SECONDARY })
                ]), resource => resource.toString());
                for (const resource of resources) {
                    if (this.fileService.canHandleResource(resource) && !this.contextService.isInsideWorkspace(resource)) {
                        visibleOutOfWorkspaceResources.set(resource, resource);
                    }
                }
            }
            // Handle no longer visible out of workspace resources
            for (const resource of this.activeOutOfWorkspaceWatchers.keys()) {
                if (!visibleOutOfWorkspaceResources.get(resource)) {
                    (0, lifecycle_1.dispose)(this.activeOutOfWorkspaceWatchers.get(resource));
                    this.activeOutOfWorkspaceWatchers.delete(resource);
                }
            }
            // Handle newly visible out of workspace resources
            for (const resource of visibleOutOfWorkspaceResources.keys()) {
                if (!this.activeOutOfWorkspaceWatchers.get(resource)) {
                    const disposable = this.fileService.watch(resource);
                    this.activeOutOfWorkspaceWatchers.set(resource, disposable);
                }
            }
        }
        //#endregion
        //#region File Changes: Move & Deletes to move or close opend editors
        onDidRunFileOperation(e) {
            // Handle moves specially when file is opened
            if (e.isOperation(2 /* MOVE */)) {
                this.handleMovedFile(e.resource, e.target.resource);
            }
            // Handle deletes
            if (e.isOperation(1 /* DELETE */) || e.isOperation(2 /* MOVE */)) {
                this.handleDeletedFile(e.resource, false, e.target ? e.target.resource : undefined);
            }
        }
        onDidFilesChange(e) {
            if (e.gotDeleted()) {
                this.handleDeletedFile(e, true);
            }
        }
        handleMovedFile(source, target) {
            for (const group of this.editorGroupService.groups) {
                let replacements = [];
                for (const editor of group.editors) {
                    const resource = editor.resource;
                    if (!resource || !this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
                        continue; // not matching our resource
                    }
                    // Determine new resulting target resource
                    let targetResource;
                    if (this.uriIdentityService.extUri.isEqual(source, resource)) {
                        targetResource = target; // file got moved
                    }
                    else {
                        const index = (0, extpath_1.indexOfPath)(resource.path, source.path, this.uriIdentityService.extUri.ignorePathCasing(resource));
                        targetResource = (0, resources_1.joinPath)(target, resource.path.substr(index + source.path.length + 1)); // parent folder got moved
                    }
                    // Delegate rename() to editor instance
                    const moveResult = editor.rename(group.id, targetResource);
                    if (!moveResult) {
                        return; // not target - ignore
                    }
                    const optionOverrides = {
                        preserveFocus: true,
                        pinned: group.isPinned(editor),
                        sticky: group.isSticky(editor),
                        index: group.getIndexOfEditor(editor),
                        inactive: !group.isActive(editor)
                    };
                    // Construct a replacement with our extra options mixed in
                    if (moveResult.editor instanceof editor_2.EditorInput) {
                        replacements.push({
                            editor,
                            replacement: moveResult.editor,
                            options: Object.assign(Object.assign({}, moveResult.options), optionOverrides)
                        });
                    }
                    else {
                        replacements.push({
                            editor: { resource: editor.resource },
                            replacement: Object.assign(Object.assign({}, moveResult.editor), { options: Object.assign(Object.assign({}, moveResult.editor.options), optionOverrides) })
                        });
                    }
                }
                // Apply replacements
                if (replacements.length) {
                    this.replaceEditors(replacements, group);
                }
            }
        }
        onConfigurationUpdated(configuration) {
            var _a, _b;
            if (typeof ((_b = (_a = configuration.workbench) === null || _a === void 0 ? void 0 : _a.editor) === null || _b === void 0 ? void 0 : _b.closeOnFileDelete) === 'boolean') {
                this.closeOnFileDelete = configuration.workbench.editor.closeOnFileDelete;
            }
            else {
                this.closeOnFileDelete = false; // default
            }
        }
        handleDeletedFile(arg1, isExternal, movedTo) {
            for (const editor of this.getAllNonDirtyEditors({ includeUntitled: false, supportSideBySide: true })) {
                (async () => {
                    const resource = editor.resource;
                    if (!resource) {
                        return;
                    }
                    // Handle deletes in opened editors depending on:
                    // - the user has not disabled the setting closeOnFileDelete
                    // - the file change is local
                    // - the input is  a file that is not resolved (we need to dispose because we cannot restore otherwise since we do not have the contents)
                    if (this.closeOnFileDelete || !isExternal || (this.fileEditorInputFactory.isFileEditorInput(editor) && !editor.isResolved())) {
                        // Do NOT close any opened editor that matches the resource path (either equal or being parent) of the
                        // resource we move to (movedTo). Otherwise we would close a resource that has been renamed to the same
                        // path but different casing.
                        if (movedTo && this.uriIdentityService.extUri.isEqualOrParent(resource, movedTo)) {
                            return;
                        }
                        let matches = false;
                        if (arg1 instanceof files_1.FileChangesEvent) {
                            matches = arg1.contains(resource, 2 /* DELETED */);
                        }
                        else {
                            matches = this.uriIdentityService.extUri.isEqualOrParent(resource, arg1);
                        }
                        if (!matches) {
                            return;
                        }
                        // We have received reports of users seeing delete events even though the file still
                        // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                        // Since we do not want to close an editor without reason, we have to check if the
                        // file is really gone and not just a faulty file event.
                        // This only applies to external file events, so we need to check for the isExternal
                        // flag.
                        let exists = false;
                        if (isExternal && this.fileService.canHandleResource(resource)) {
                            await (0, async_1.timeout)(100);
                            exists = await this.fileService.exists(resource);
                        }
                        if (!exists && !editor.isDisposed()) {
                            editor.dispose();
                        }
                    }
                })();
            }
        }
        getAllNonDirtyEditors(options) {
            const editors = [];
            function conditionallyAddEditor(editor) {
                if (editor.isUntitled() && !options.includeUntitled) {
                    return;
                }
                if (editor.isDirty()) {
                    return;
                }
                editors.push(editor);
            }
            for (const editor of this.editors) {
                if (options.supportSideBySide && editor instanceof editor_2.SideBySideEditorInput) {
                    conditionallyAddEditor(editor.primary);
                    conditionallyAddEditor(editor.secondary);
                }
                else {
                    conditionallyAddEditor(editor);
                }
            }
            return editors;
        }
        get activeEditorPane() {
            var _a;
            return (_a = this.editorGroupService.activeGroup) === null || _a === void 0 ? void 0 : _a.activeEditorPane;
        }
        get activeTextEditorControl() {
            const activeEditorPane = this.activeEditorPane;
            if (activeEditorPane) {
                const activeControl = activeEditorPane.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(activeControl) || (0, editorBrowser_1.isDiffEditor)(activeControl)) {
                    return activeControl;
                }
                if ((0, editorBrowser_1.isCompositeEditor)(activeControl) && (0, editorBrowser_1.isCodeEditor)(activeControl.activeCodeEditor)) {
                    return activeControl.activeCodeEditor;
                }
            }
            return undefined;
        }
        get activeTextEditorMode() {
            var _a;
            let activeCodeEditor = undefined;
            const activeTextEditorControl = this.activeTextEditorControl;
            if ((0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)) {
                activeCodeEditor = activeTextEditorControl.getModifiedEditor();
            }
            else {
                activeCodeEditor = activeTextEditorControl;
            }
            return (_a = activeCodeEditor === null || activeCodeEditor === void 0 ? void 0 : activeCodeEditor.getModel()) === null || _a === void 0 ? void 0 : _a.getLanguageIdentifier().language;
        }
        get count() {
            return this.editorsObserver.count;
        }
        get editors() {
            return this.getEditors(1 /* SEQUENTIAL */).map(({ editor }) => editor);
        }
        getEditors(order, options) {
            switch (order) {
                // MRU
                case 0 /* MOST_RECENTLY_ACTIVE */:
                    if (options === null || options === void 0 ? void 0 : options.excludeSticky) {
                        return this.editorsObserver.editors.filter(({ groupId, editor }) => { var _a; return !((_a = this.editorGroupService.getGroup(groupId)) === null || _a === void 0 ? void 0 : _a.isSticky(editor)); });
                    }
                    return this.editorsObserver.editors;
                // Sequential
                case 1 /* SEQUENTIAL */:
                    const editors = [];
                    for (const group of this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */)) {
                        editors.push(...group.getEditors(1 /* SEQUENTIAL */, options).map(editor => ({ editor, groupId: group.id })));
                    }
                    return editors;
            }
        }
        get activeEditor() {
            const activeGroup = this.editorGroupService.activeGroup;
            return activeGroup ? (0, types_1.withNullAsUndefined)(activeGroup.activeEditor) : undefined;
        }
        get visibleEditorPanes() {
            return (0, arrays_1.coalesce)(this.editorGroupService.groups.map(group => group.activeEditorPane));
        }
        get visibleTextEditorControls() {
            const visibleTextEditorControls = [];
            for (const visibleEditorPane of this.visibleEditorPanes) {
                const control = visibleEditorPane.getControl();
                if ((0, editorBrowser_1.isCodeEditor)(control) || (0, editorBrowser_1.isDiffEditor)(control)) {
                    visibleTextEditorControls.push(control);
                }
            }
            return visibleTextEditorControls;
        }
        get visibleEditors() {
            return (0, arrays_1.coalesce)(this.editorGroupService.groups.map(group => group.activeEditor));
        }
        overrideOpenEditor(handler) {
            const remove = (0, arrays_1.insert)(this.openEditorOverrides, handler);
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        getEditorOverrides(resource, options, group) {
            const overrides = [];
            // Collect contributed editor open overrides
            for (const openEditorOverride of this.openEditorOverrides) {
                if (typeof openEditorOverride.getEditorOverrides === 'function') {
                    try {
                        overrides.push(...openEditorOverride.getEditorOverrides(resource, options, group).map(val => [openEditorOverride, val]));
                    }
                    catch (error) {
                        this.logService.error(`Unexpected error getting editor overrides: ${error}`);
                    }
                }
            }
            // Ensure the default one is always present
            if (!overrides.some(([, entry]) => entry.id === editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id)) {
                overrides.unshift(this.getDefaultEditorOverride(resource));
            }
            return overrides;
        }
        registerDefaultOverride() {
            this._register(this.editorOverrideService.registerContributionPoint('*', {
                id: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id,
                label: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.displayName,
                detail: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                describes: (currentEditor) => this.fileEditorInputFactory.isFileEditorInput(currentEditor) && currentEditor.matches(this.activeEditor),
                priority: editorOverrideService_1.ContributedEditorPriority.builtin
            }, {}, resource => ({ editor: this.createEditorInput({ resource }) }), diffEditor => ({ editor: diffEditor })));
        }
        getDefaultEditorOverride(resource) {
            return [
                {
                    open: (editor, options, group) => {
                        const resource = editor_2.EditorResourceAccessor.getOriginalUri(editor);
                        if (!resource) {
                            return;
                        }
                        const fileEditorInput = this.createEditorInput({ resource, forceFile: true });
                        const textOptions = Object.assign(Object.assign({}, options), { override: editor_1.EditorOverride.DISABLED });
                        return {
                            override: (async () => {
                                var _a;
                                // Try to replace existing editors for resource
                                const existingEditor = (0, arrays_1.firstOrDefault)(this.findEditors(resource, group));
                                if (existingEditor && !fileEditorInput.matches(existingEditor)) {
                                    await this.replaceEditors([{
                                            editor: existingEditor,
                                            replacement: fileEditorInput,
                                            forceReplaceDirty: ((_a = existingEditor.resource) === null || _a === void 0 ? void 0 : _a.scheme) === network_1.Schemas.untitled,
                                            options: options ? editor_2.EditorOptions.create(options) : undefined,
                                        }], group);
                                }
                                return this.openEditor(fileEditorInput, textOptions, group);
                            })()
                        };
                    }
                },
                {
                    id: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id,
                    label: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.displayName,
                    detail: editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
                    active: this.fileEditorInputFactory.isFileEditorInput(this.activeEditor) && (0, resources_1.isEqual)(this.activeEditor.resource, resource),
                }
            ];
        }
        doOverrideOpenEditor(editor, options, group) {
            for (const openEditorOverride of this.openEditorOverrides) {
                const result = openEditorOverride.open(editor, options, group);
                const override = result === null || result === void 0 ? void 0 : result.override;
                if (override) {
                    return override;
                }
            }
            return;
        }
        async openEditor(editor, optionsOrGroup, group) {
            var _a, _b, _c, _d;
            const result = this.doResolveEditorOpenRequest(editor, optionsOrGroup, group);
            if (result) {
                const [resolvedGroup, resolvedEditor, resolvedOptions] = result;
                // Override handling: pick editor or open specific
                if ((resolvedOptions === null || resolvedOptions === void 0 ? void 0 : resolvedOptions.override) === editor_1.EditorOverride.PICK || typeof (resolvedOptions === null || resolvedOptions === void 0 ? void 0 : resolvedOptions.override) === 'string') {
                    const resolvedInputWithOptionsAndGroup = await this.editorOverrideService.resolveEditorOverride(resolvedEditor, resolvedOptions, resolvedGroup);
                    if (!resolvedInputWithOptionsAndGroup) {
                        return undefined; // no editor was picked or registered for the identifier
                    }
                    return ((_a = resolvedInputWithOptionsAndGroup.group) !== null && _a !== void 0 ? _a : resolvedGroup).openEditor(resolvedInputWithOptionsAndGroup.editor, (_b = resolvedInputWithOptionsAndGroup.options) !== null && _b !== void 0 ? _b : resolvedOptions);
                }
                // Override handling: ask providers to override
                if ((resolvedOptions === null || resolvedOptions === void 0 ? void 0 : resolvedOptions.override) !== editor_1.EditorOverride.DISABLED) {
                    // TODO@lramos15 this will get cleaned up soon, but since the override
                    // service no longer uses the override flow we must check that
                    const resolvedInputWithOptionsAndGroup = await this.editorOverrideService.resolveEditorOverride(resolvedEditor, resolvedOptions, resolvedGroup);
                    // If we didn't override try the legacy overrides
                    if (!resolvedInputWithOptionsAndGroup || resolvedEditor.matches(resolvedInputWithOptionsAndGroup.editor)) {
                        const override = this.doOverrideOpenEditor(resolvedEditor, resolvedOptions, resolvedGroup);
                        if (override) {
                            return override;
                        }
                    }
                    else {
                        return ((_c = resolvedInputWithOptionsAndGroup.group) !== null && _c !== void 0 ? _c : resolvedGroup).openEditor(resolvedInputWithOptionsAndGroup.editor, (_d = resolvedInputWithOptionsAndGroup.options) !== null && _d !== void 0 ? _d : resolvedOptions);
                    }
                }
                // Override handling: disabled
                return resolvedGroup.openEditor(resolvedEditor, resolvedOptions);
            }
            return undefined;
        }
        doResolveEditorOpenRequest(editor, optionsOrGroup, group) {
            let resolvedGroup;
            let candidateGroup;
            let typedEditor;
            let typedOptions;
            // Typed Editor Support
            if (editor instanceof editor_2.EditorInput) {
                typedEditor = editor;
                typedOptions = this.toOptions(optionsOrGroup);
                candidateGroup = group;
                resolvedGroup = this.findTargetGroup(typedEditor, typedOptions, candidateGroup);
            }
            // Untyped Text Editor Support
            else {
                const textInput = editor;
                typedEditor = this.createEditorInput(textInput);
                if (typedEditor) {
                    typedOptions = editor_2.TextEditorOptions.from(textInput);
                    candidateGroup = optionsOrGroup;
                    resolvedGroup = this.findTargetGroup(typedEditor, typedOptions, candidateGroup);
                }
            }
            if (typedEditor && resolvedGroup) {
                if (this.editorGroupService.activeGroup !== resolvedGroup && // only if target group is not already active
                    typedOptions && !typedOptions.inactive && // never for inactive editors
                    typedOptions.preserveFocus && // only if preserveFocus
                    typeof typedOptions.activation !== 'number' && // only if activation is not already defined (either true or false)
                    candidateGroup !== editorService_1.SIDE_GROUP // never for the SIDE_GROUP
                ) {
                    // If the resolved group is not the active one, we typically
                    // want the group to become active. There are a few cases
                    // where we stay away from encorcing this, e.g. if the caller
                    // is already providing `activation`.
                    //
                    // Specifically for historic reasons we do not activate a
                    // group is it is opened as `SIDE_GROUP` with `preserveFocus:true`.
                    // repeated Alt-clicking of files in the explorer always open
                    // into the same side group and not cause a group to be created each time.
                    typedOptions.overwrite({ activation: editor_1.EditorActivation.ACTIVATE });
                }
                return [resolvedGroup, typedEditor, typedOptions];
            }
            return undefined;
        }
        findTargetGroup(editor, options, group) {
            let targetGroup;
            // Group: Instance of Group
            if (group && typeof group !== 'number') {
                targetGroup = group;
            }
            // Group: Side by Side
            else if (group === editorService_1.SIDE_GROUP) {
                targetGroup = this.findSideBySideGroup();
            }
            // Group: Specific Group
            else if (typeof group === 'number' && group >= 0) {
                targetGroup = this.editorGroupService.getGroup(group);
            }
            // Group: Unspecified without a specific index to open
            else if (!options || typeof options.index !== 'number') {
                const groupsByLastActive = this.editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
                // Respect option to reveal an editor if it is already visible in any group
                if (options === null || options === void 0 ? void 0 : options.revealIfVisible) {
                    for (const group of groupsByLastActive) {
                        if (group.isActive(editor)) {
                            targetGroup = group;
                            break;
                        }
                    }
                }
                // Respect option to reveal an editor if it is open (not necessarily visible)
                // Still prefer to reveal an editor in a group where the editor is active though.
                if (!targetGroup) {
                    if ((options === null || options === void 0 ? void 0 : options.revealIfOpened) || this.configurationService.getValue('workbench.editor.revealIfOpen')) {
                        let groupWithInputActive = undefined;
                        let groupWithInputOpened = undefined;
                        for (const group of groupsByLastActive) {
                            if (group.contains(editor)) {
                                if (!groupWithInputOpened) {
                                    groupWithInputOpened = group;
                                }
                                if (!groupWithInputActive && group.isActive(editor)) {
                                    groupWithInputActive = group;
                                }
                            }
                            if (groupWithInputOpened && groupWithInputActive) {
                                break; // we found all groups we wanted
                            }
                        }
                        // Prefer a target group where the input is visible
                        targetGroup = groupWithInputActive || groupWithInputOpened;
                    }
                }
            }
            // Fallback to active group if target not valid
            if (!targetGroup) {
                targetGroup = this.editorGroupService.activeGroup;
            }
            return targetGroup;
        }
        findSideBySideGroup() {
            const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
            let neighbourGroup = this.editorGroupService.findGroup({ direction });
            if (!neighbourGroup) {
                neighbourGroup = this.editorGroupService.addGroup(this.editorGroupService.activeGroup, direction);
            }
            return neighbourGroup;
        }
        toOptions(options) {
            if (!options || options instanceof editor_2.EditorOptions) {
                return options;
            }
            const textOptions = options;
            if (textOptions.selection || textOptions.viewState) {
                return editor_2.TextEditorOptions.create(options);
            }
            return editor_2.EditorOptions.create(options);
        }
        async openEditors(editors, group) {
            var _a;
            // Convert to typed editors and options
            const typedEditors = editors.map(editor => {
                if ((0, editor_2.isEditorInputWithOptions)(editor)) {
                    return editor;
                }
                return {
                    editor: this.createEditorInput(editor),
                    options: editor_2.TextEditorOptions.from(editor)
                };
            });
            // Find target groups to open
            const mapGroupToEditorsCandidates = new Map();
            if (group === editorService_1.SIDE_GROUP) {
                mapGroupToEditorsCandidates.set(this.findSideBySideGroup(), typedEditors);
            }
            else {
                for (const typedEditor of typedEditors) {
                    const targetGroup = this.findTargetGroup(typedEditor.editor, typedEditor.options, group);
                    let targetGroupEditors = mapGroupToEditorsCandidates.get(targetGroup);
                    if (!targetGroupEditors) {
                        targetGroupEditors = [];
                        mapGroupToEditorsCandidates.set(targetGroup, targetGroupEditors);
                    }
                    targetGroupEditors.push(typedEditor);
                }
            }
            // Resolve overrides
            const mapGroupToEditors = new Map();
            for (const [group, editorsWithOptions] of mapGroupToEditorsCandidates) {
                for (const { editor, options } of editorsWithOptions) {
                    let editorOverride;
                    if ((options === null || options === void 0 ? void 0 : options.override) !== editor_1.EditorOverride.DISABLED) {
                        editorOverride = await this.editorOverrideService.resolveEditorOverride(editor, options, group);
                    }
                    const targetGroup = (_a = editorOverride === null || editorOverride === void 0 ? void 0 : editorOverride.group) !== null && _a !== void 0 ? _a : group;
                    let targetGroupEditors = mapGroupToEditors.get(targetGroup);
                    if (!targetGroupEditors) {
                        targetGroupEditors = [];
                        mapGroupToEditors.set(targetGroup, targetGroupEditors);
                    }
                    targetGroupEditors.push(editorOverride !== null && editorOverride !== void 0 ? editorOverride : { editor, options });
                }
            }
            // Open in target groups
            const result = [];
            for (const [group, editorsWithOptions] of mapGroupToEditors) {
                result.push(group.openEditors(editorsWithOptions));
            }
            return (0, arrays_1.coalesce)(await async_1.Promises.settled(result));
        }
        //#endregion
        //#region isOpened()
        isOpened(editor) {
            return this.editorsObserver.hasEditor({
                resource: this.asCanonicalEditorResource(editor.resource),
                typeId: editor.typeId
            });
        }
        findEditors(arg1, arg2) {
            const resource = uri_1.URI.isUri(arg1) ? arg1 : arg1.resource;
            const typeId = uri_1.URI.isUri(arg1) ? undefined : arg1.typeId;
            // Do a quick check for the resource via the editor observer
            // which is a very efficient way to find an editor by resource
            if (!this.editorsObserver.hasEditors(resource)) {
                if (uri_1.URI.isUri(arg1) || (0, types_1.isUndefined)(arg2)) {
                    return [];
                }
                return undefined;
            }
            // Search only in specific group
            if (!(0, types_1.isUndefined)(arg2)) {
                const targetGroup = typeof arg2 === 'number' ? this.editorGroupService.getGroup(arg2) : arg2;
                // Resource provided: result is an array
                if (uri_1.URI.isUri(arg1)) {
                    if (!targetGroup) {
                        return [];
                    }
                    return targetGroup.findEditors(resource);
                }
                // Editor identifier provided, result is single
                else {
                    if (!targetGroup) {
                        return undefined;
                    }
                    const editors = targetGroup.findEditors(resource);
                    for (const editor of editors) {
                        if (editor.typeId === typeId) {
                            return editor;
                        }
                    }
                    return undefined;
                }
            }
            // Search across all groups in MRU order
            else {
                const result = [];
                for (const group of this.editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
                    const editors = [];
                    // Resource provided: result is an array
                    if (uri_1.URI.isUri(arg1)) {
                        editors.push(...this.findEditors(arg1, group));
                    }
                    // Editor identifier provided, result is single
                    else {
                        const editor = this.findEditors(arg1, group);
                        if (editor) {
                            editors.push(editor);
                        }
                    }
                    result.push(...editors.map(editor => ({ editor, groupId: group.id })));
                }
                return result;
            }
        }
        async replaceEditors(editors, group) {
            var _a, _b, _c;
            const typedEditors = [];
            const targetGroup = typeof group === 'number' ? this.editorGroupService.getGroup(group) : group;
            for (const replaceEditorArg of editors) {
                if (replaceEditorArg.editor instanceof editor_2.EditorInput) {
                    const replacementArg = replaceEditorArg;
                    if (((_a = replacementArg.options) === null || _a === void 0 ? void 0 : _a.override) !== editor_1.EditorOverride.DISABLED && targetGroup) {
                        const override = await this.editorOverrideService.resolveEditorOverride(replacementArg.replacement, replacementArg.options, targetGroup);
                        replacementArg.options = (_b = override === null || override === void 0 ? void 0 : override.options) !== null && _b !== void 0 ? _b : replacementArg.options;
                        replacementArg.replacement = (_c = override === null || override === void 0 ? void 0 : override.editor) !== null && _c !== void 0 ? _c : replacementArg.replacement;
                    }
                    typedEditors.push({
                        editor: replacementArg.editor,
                        replacement: replacementArg.replacement,
                        forceReplaceDirty: replacementArg.forceReplaceDirty,
                        options: this.toOptions(replacementArg.options)
                    });
                }
                else {
                    const replacementArg = replaceEditorArg;
                    typedEditors.push({
                        editor: this.createEditorInput(replacementArg.editor),
                        replacement: this.createEditorInput(replacementArg.replacement),
                        options: this.toOptions(replacementArg.replacement.options)
                    });
                }
            }
            if (targetGroup) {
                return targetGroup.replaceEditors(typedEditors);
            }
        }
        createEditorInput(input) {
            var _a;
            // Typed Editor Input Support (EditorInput)
            if (input instanceof editor_2.EditorInput) {
                return input;
            }
            // Typed Editor Input Support (IEditorInputWithOptions)
            const editorInputWithOptions = input;
            if (editorInputWithOptions.editor instanceof editor_2.EditorInput) {
                return editorInputWithOptions.editor;
            }
            // Diff Editor Support
            const resourceDiffInput = input;
            if (resourceDiffInput.leftResource && resourceDiffInput.rightResource) {
                const leftInput = this.createEditorInput({ resource: resourceDiffInput.leftResource, forceFile: resourceDiffInput.forceFile });
                const rightInput = this.createEditorInput({ resource: resourceDiffInput.rightResource, forceFile: resourceDiffInput.forceFile });
                return this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, resourceDiffInput.label, resourceDiffInput.description, leftInput, rightInput, undefined);
            }
            // Untitled file support
            const untitledInput = input;
            if (untitledInput.forceUntitled || !untitledInput.resource || (untitledInput.resource && untitledInput.resource.scheme === network_1.Schemas.untitled)) {
                const untitledOptions = {
                    mode: untitledInput.mode,
                    initialValue: untitledInput.contents,
                    encoding: untitledInput.encoding
                };
                // Untitled resource: use as hint for an existing untitled editor
                let untitledModel;
                if (((_a = untitledInput.resource) === null || _a === void 0 ? void 0 : _a.scheme) === network_1.Schemas.untitled) {
                    untitledModel = this.untitledTextEditorService.create(Object.assign({ untitledResource: untitledInput.resource }, untitledOptions));
                }
                // Other resource: use as hint for associated filepath
                else {
                    untitledModel = this.untitledTextEditorService.create(Object.assign({ associatedResource: untitledInput.resource }, untitledOptions));
                }
                return this.createOrGetCached(untitledModel.resource, () => {
                    // Factory function for new untitled editor
                    const input = this.instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, untitledModel);
                    // We dispose the untitled model once the editor
                    // is being disposed. Even though we may have not
                    // created the model initially, the lifecycle for
                    // untitled is tightly coupled with the editor
                    // lifecycle for now.
                    event_1.Event.once(input.onWillDispose)(() => untitledModel.dispose());
                    return input;
                });
            }
            // Resource Editor Support
            const resourceEditorInput = input;
            if (resourceEditorInput.resource instanceof uri_1.URI) {
                // Derive the label from the path if not provided explicitly
                const label = resourceEditorInput.label || (0, resources_1.basename)(resourceEditorInput.resource);
                // We keep track of the preferred resource this input is to be created
                // with but it may be different from the canonical resource (see below)
                const preferredResource = resourceEditorInput.resource;
                // From this moment on, only operate on the canonical resource
                // to ensure we reduce the chance of opening the same resource
                // with different resource forms (e.g. path casing on Windows)
                const canonicalResource = this.asCanonicalEditorResource(preferredResource);
                return this.createOrGetCached(canonicalResource, () => {
                    // File
                    if (resourceEditorInput.forceFile || this.fileService.canHandleResource(canonicalResource)) {
                        return this.fileEditorInputFactory.createFileEditorInput(canonicalResource, preferredResource, resourceEditorInput.label, resourceEditorInput.description, resourceEditorInput.encoding, resourceEditorInput.mode, this.instantiationService);
                    }
                    // Resource
                    return this.instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, canonicalResource, resourceEditorInput.label, resourceEditorInput.description, resourceEditorInput.mode);
                }, cachedInput => {
                    // Untitled
                    if (cachedInput instanceof untitledTextEditorInput_1.UntitledTextEditorInput) {
                        return;
                    }
                    // Files
                    else if (!(cachedInput instanceof resourceEditorInput_1.ResourceEditorInput)) {
                        cachedInput.setPreferredResource(preferredResource);
                        if (resourceEditorInput.label) {
                            cachedInput.setPreferredName(resourceEditorInput.label);
                        }
                        if (resourceEditorInput.description) {
                            cachedInput.setPreferredDescription(resourceEditorInput.description);
                        }
                        if (resourceEditorInput.encoding) {
                            cachedInput.setPreferredEncoding(resourceEditorInput.encoding);
                        }
                        if (resourceEditorInput.mode) {
                            cachedInput.setPreferredMode(resourceEditorInput.mode);
                        }
                    }
                    // Resources
                    else {
                        if (label) {
                            cachedInput.setName(label);
                        }
                        if (resourceEditorInput.description) {
                            cachedInput.setDescription(resourceEditorInput.description);
                        }
                        if (resourceEditorInput.mode) {
                            cachedInput.setPreferredMode(resourceEditorInput.mode);
                        }
                    }
                });
            }
            throw new Error('Unknown input type');
        }
        get modelService() {
            if (!this._modelService) {
                this._modelService = this.instantiationService.invokeFunction(accessor => accessor.get(modelService_1.IModelService));
            }
            return this._modelService;
        }
        asCanonicalEditorResource(resource) {
            var _a;
            const canonicalResource = this.uriIdentityService.asCanonicalUri(resource);
            // In the unlikely case that a model exists for the original resource but
            // differs from the canonical resource, we print a warning as this means
            // the model will not be able to be opened as editor.
            if (!(0, resources_1.isEqual)(resource, canonicalResource) && ((_a = this.modelService) === null || _a === void 0 ? void 0 : _a.getModel(resource))) {
                this.logService.warn(`EditorService: a model exists for a resource that is not canonical: ${resource.toString(true)}`);
            }
            return canonicalResource;
        }
        createOrGetCached(resource, factoryFn, cachedFn) {
            // Return early if already cached
            let input = this.editorInputCache.get(resource);
            if (input) {
                if (cachedFn) {
                    cachedFn(input);
                }
                return input;
            }
            // Otherwise create and add to cache
            input = factoryFn();
            this.editorInputCache.set(resource, input);
            event_1.Event.once(input.onWillDispose)(() => this.editorInputCache.delete(resource));
            return input;
        }
        //#endregion
        //#region save/revert
        async save(editors, options) {
            // Convert to array
            if (!Array.isArray(editors)) {
                editors = [editors];
            }
            // Make sure to not save the same editor multiple times
            // by using the `matches()` method to find duplicates
            const uniqueEditors = this.getUniqueEditors(editors);
            // Split editors up into a bucket that is saved in parallel
            // and sequentially. Unless "Save As", all non-untitled editors
            // can be saved in parallel to speed up the operation. Remaining
            // editors are potentially bringing up some UI and thus run
            // sequentially.
            const editorsToSaveParallel = [];
            const editorsToSaveSequentially = [];
            if (options === null || options === void 0 ? void 0 : options.saveAs) {
                editorsToSaveSequentially.push(...uniqueEditors);
            }
            else {
                for (const { groupId, editor } of uniqueEditors) {
                    if (editor.isUntitled()) {
                        editorsToSaveSequentially.push({ groupId, editor });
                    }
                    else {
                        editorsToSaveParallel.push({ groupId, editor });
                    }
                }
            }
            // Editors to save in parallel
            const saveResults = await async_1.Promises.settled(editorsToSaveParallel.map(({ groupId, editor }) => {
                var _a;
                // Use save as a hint to pin the editor if used explicitly
                if ((options === null || options === void 0 ? void 0 : options.reason) === 1 /* EXPLICIT */) {
                    (_a = this.editorGroupService.getGroup(groupId)) === null || _a === void 0 ? void 0 : _a.pinEditor(editor);
                }
                // Save
                return editor.save(groupId, options);
            }));
            // Editors to save sequentially
            for (const { groupId, editor } of editorsToSaveSequentially) {
                if (editor.isDisposed()) {
                    continue; // might have been disposed from the save already
                }
                // Preserve view state by opening the editor first if the editor
                // is untitled or we "Save As". This also allows the user to review
                // the contents of the editor before making a decision.
                let viewState = undefined;
                const editorPane = await this.openEditor(editor, undefined, groupId);
                if ((0, editor_2.isTextEditorPane)(editorPane)) {
                    viewState = editorPane.getViewState();
                }
                const result = (options === null || options === void 0 ? void 0 : options.saveAs) ? await editor.saveAs(groupId, options) : await editor.save(groupId, options);
                saveResults.push(result);
                if (!result) {
                    break; // failed or cancelled, abort
                }
                // Replace editor preserving viewstate (either across all groups or
                // only selected group) if the resulting editor is different from the
                // current one.
                if (!result.matches(editor)) {
                    const targetGroups = editor.isUntitled() ? this.editorGroupService.groups.map(group => group.id) /* untitled replaces across all groups */ : [groupId];
                    for (const group of targetGroups) {
                        await this.replaceEditors([{ editor, replacement: result, options: { pinned: true, viewState } }], group);
                    }
                }
            }
            return saveResults.every(result => !!result);
        }
        saveAll(options) {
            return this.save(this.getAllDirtyEditors(options), options);
        }
        async revert(editors, options) {
            // Convert to array
            if (!Array.isArray(editors)) {
                editors = [editors];
            }
            // Make sure to not revert the same editor multiple times
            // by using the `matches()` method to find duplicates
            const uniqueEditors = this.getUniqueEditors(editors);
            await async_1.Promises.settled(uniqueEditors.map(async ({ groupId, editor }) => {
                var _a;
                // Use revert as a hint to pin the editor
                (_a = this.editorGroupService.getGroup(groupId)) === null || _a === void 0 ? void 0 : _a.pinEditor(editor);
                return editor.revert(groupId, options);
            }));
            return !uniqueEditors.some(({ editor }) => editor.isDirty());
        }
        async revertAll(options) {
            return this.revert(this.getAllDirtyEditors(options), options);
        }
        getAllDirtyEditors(options) {
            const editors = [];
            for (const group of this.editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
                for (const editor of group.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
                    if (!editor.isDirty()) {
                        continue;
                    }
                    if (!(options === null || options === void 0 ? void 0 : options.includeUntitled) && editor.isUntitled()) {
                        continue;
                    }
                    if ((options === null || options === void 0 ? void 0 : options.excludeSticky) && group.isSticky(editor)) {
                        continue;
                    }
                    editors.push({ groupId: group.id, editor });
                }
            }
            return editors;
        }
        getUniqueEditors(editors) {
            const uniqueEditors = [];
            for (const { editor, groupId } of editors) {
                if (uniqueEditors.some(uniqueEditor => uniqueEditor.editor.matches(editor))) {
                    continue;
                }
                uniqueEditors.push({ editor, groupId });
            }
            return uniqueEditors;
        }
        //#endregion
        dispose() {
            super.dispose();
            // Dispose remaining watchers if any
            this.activeOutOfWorkspaceWatchers.forEach(disposable => (0, lifecycle_1.dispose)(disposable));
            this.activeOutOfWorkspaceWatchers.clear();
        }
    };
    EditorService = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, files_1.IFileService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, log_1.ILogService),
        __param(8, editorOverrideService_1.IEditorOverrideService)
    ], EditorService);
    exports.EditorService = EditorService;
    /**
     * The delegating workbench editor service can be used to override the behaviour of the openEditor()
     * method by providing a IEditorOpenHandler. All calls are being delegated to the existing editor
     * service otherwise.
     */
    let DelegatingEditorService = class DelegatingEditorService {
        constructor(editorOpenHandler, editorService) {
            this.editorOpenHandler = editorOpenHandler;
            this.editorService = editorService;
        }
        async openEditor(editor, optionsOrGroup, group) {
            const result = this.editorService.doResolveEditorOpenRequest(editor, optionsOrGroup, group);
            if (result) {
                const [resolvedGroup, resolvedEditor, resolvedOptions] = result;
                return this.editorOpenHandler(resolvedGroup, () => this.editorService.openEditor(resolvedEditor, resolvedOptions, resolvedGroup));
            }
            return undefined;
        }
        //#region Delegate to IEditorService
        get onDidActiveEditorChange() { return this.editorService.onDidActiveEditorChange; }
        get onDidVisibleEditorsChange() { return this.editorService.onDidVisibleEditorsChange; }
        get onDidCloseEditor() { return this.editorService.onDidCloseEditor; }
        get activeEditor() { return this.editorService.activeEditor; }
        get activeEditorPane() { return this.editorService.activeEditorPane; }
        get activeTextEditorControl() { return this.editorService.activeTextEditorControl; }
        get activeTextEditorMode() { return this.editorService.activeTextEditorMode; }
        get visibleEditors() { return this.editorService.visibleEditors; }
        get visibleEditorPanes() { return this.editorService.visibleEditorPanes; }
        get visibleTextEditorControls() { return this.editorService.visibleTextEditorControls; }
        get editors() { return this.editorService.editors; }
        get count() { return this.editorService.count; }
        getEditors(order, options) { return this.editorService.getEditors(order, options); }
        openEditors(editors, group) {
            return this.editorService.openEditors(editors, group);
        }
        replaceEditors(editors, group) {
            return this.editorService.replaceEditors(editors, group);
        }
        isOpened(editor) { return this.editorService.isOpened(editor); }
        findEditors(arg1, arg2) { return this.editorService.findEditors(arg1, arg2); }
        overrideOpenEditor(handler) { return this.editorService.overrideOpenEditor(handler); }
        getEditorOverrides(resource, options, group) { return this.editorService.getEditorOverrides(resource, options, group); }
        createEditorInput(input) { return this.editorService.createEditorInput(input); }
        save(editors, options) { return this.editorService.save(editors, options); }
        saveAll(options) { return this.editorService.saveAll(options); }
        revert(editors, options) { return this.editorService.revert(editors, options); }
        revertAll(options) { return this.editorService.revertAll(options); }
    };
    DelegatingEditorService = __decorate([
        __param(1, editorService_1.IEditorService)
    ], DelegatingEditorService);
    exports.DelegatingEditorService = DelegatingEditorService;
    (0, extensions_1.registerSingleton)(editorService_1.IEditorService, EditorService);
});
//# sourceMappingURL=editorService.js.map