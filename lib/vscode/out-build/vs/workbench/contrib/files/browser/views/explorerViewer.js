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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/glob", "vs/platform/progress/common/progress", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/layout/browser/layoutService", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/common/files", "vs/base/common/resources", "vs/base/browser/ui/inputbox/inputBox", "vs/nls!vs/workbench/contrib/files/browser/views/explorerViewer", "vs/platform/theme/common/styler", "vs/base/common/functional", "vs/base/common/objects", "vs/base/common/path", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/comparers", "vs/workbench/browser/dnd", "vs/platform/instantiation/common/instantiation", "vs/base/browser/dnd", "vs/base/common/network", "vs/base/browser/ui/list/listView", "vs/base/common/platform", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/host/browser/host", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/base/common/uri", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/browser/fileActions", "vs/base/common/filters", "vs/base/common/event", "vs/base/common/buffer", "vs/platform/label/common/label", "vs/base/common/types", "vs/base/browser/event", "vs/base/common/cancellation", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files"], function (require, exports, DOM, glob, progress_1, notification_1, files_1, layoutService_1, workspace_1, lifecycle_1, contextView_1, themeService_1, configuration_1, files_2, resources_1, inputBox_1, nls_1, styler_1, functional_1, objects_1, path, explorerModel_1, comparers_1, dnd_1, instantiation_1, dnd_2, network_1, listView_1, platform_1, dialogs_1, host_1, workspaceEditing_1, uri_1, async_1, editorService_1, fileActions_1, filters_1, event_1, buffer_1, label_1, types_1, event_2, cancellation_1, uriIdentity_1, bulkEditService_1, files_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExplorerCompressionDelegate = exports.isCompressedFolderName = exports.FileDragAndDrop = exports.FileSorter = exports.FilesFilter = exports.FilesRenderer = exports.CompressedNavigationController = exports.ExplorerDataSource = exports.explorerRootErrorEmitter = exports.ExplorerDelegate = void 0;
    class ExplorerDelegate {
        getHeight(element) {
            return ExplorerDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            return FilesRenderer.ID;
        }
    }
    exports.ExplorerDelegate = ExplorerDelegate;
    ExplorerDelegate.ITEM_HEIGHT = 22;
    exports.explorerRootErrorEmitter = new event_1.Emitter();
    let ExplorerDataSource = class ExplorerDataSource {
        constructor(progressService, notificationService, layoutService, fileService, explorerService, contextService) {
            this.progressService = progressService;
            this.notificationService = notificationService;
            this.layoutService = layoutService;
            this.fileService = fileService;
            this.explorerService = explorerService;
            this.contextService = contextService;
        }
        hasChildren(element) {
            return Array.isArray(element) || element.isDirectory;
        }
        getChildren(element) {
            if (Array.isArray(element)) {
                return Promise.resolve(element);
            }
            const sortOrder = this.explorerService.sortOrder;
            const promise = element.fetchChildren(sortOrder).then(undefined, e => {
                if (element instanceof explorerModel_1.ExplorerItem && element.isRoot) {
                    if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
                        // Single folder create a dummy explorer item to show error
                        const placeholder = new explorerModel_1.ExplorerItem(element.resource, this.fileService, undefined, false);
                        placeholder.isError = true;
                        return [placeholder];
                    }
                    else {
                        exports.explorerRootErrorEmitter.fire(element.resource);
                    }
                }
                else {
                    // Do not show error for roots since we already use an explorer decoration to notify user
                    this.notificationService.error(e);
                }
                return []; // we could not resolve any children because of an error
            });
            this.progressService.withProgress({
                location: 1 /* Explorer */,
                delay: this.layoutService.isRestored() ? 800 : 1500 // reduce progress visibility when still restoring
            }, _progress => promise);
            return promise;
        }
    };
    ExplorerDataSource = __decorate([
        __param(0, progress_1.IProgressService),
        __param(1, notification_1.INotificationService),
        __param(2, layoutService_1.IWorkbenchLayoutService),
        __param(3, files_1.IFileService),
        __param(4, files_3.IExplorerService),
        __param(5, workspace_1.IWorkspaceContextService)
    ], ExplorerDataSource);
    exports.ExplorerDataSource = ExplorerDataSource;
    class CompressedNavigationController {
        constructor(id, items, templateData, depth, collapsed) {
            this.id = id;
            this.items = items;
            this.depth = depth;
            this.collapsed = collapsed;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._index = items.length - 1;
            this.updateLabels(templateData);
            this._updateLabelDisposable = templateData.label.onDidRender(() => this.updateLabels(templateData));
        }
        get index() { return this._index; }
        get count() { return this.items.length; }
        get current() { return this.items[this._index]; }
        get currentId() { return `${this.id}_${this.index}`; }
        get labels() { return this._labels; }
        updateLabels(templateData) {
            this._labels = Array.from(templateData.container.querySelectorAll('.label-name'));
            let parents = '';
            for (let i = 0; i < this.labels.length; i++) {
                const ariaLabel = parents.length ? `${this.items[i].name}, compact, ${parents}` : this.items[i].name;
                this.labels[i].setAttribute('aria-label', ariaLabel);
                this.labels[i].setAttribute('aria-level', `${this.depth + i}`);
                parents = parents.length ? `${this.items[i].name} ${parents}` : this.items[i].name;
            }
            this.updateCollapsed(this.collapsed);
            if (this._index < this.labels.length) {
                this.labels[this._index].classList.add('active');
            }
        }
        previous() {
            if (this._index <= 0) {
                return;
            }
            this.setIndex(this._index - 1);
        }
        next() {
            if (this._index >= this.items.length - 1) {
                return;
            }
            this.setIndex(this._index + 1);
        }
        first() {
            if (this._index === 0) {
                return;
            }
            this.setIndex(0);
        }
        last() {
            if (this._index === this.items.length - 1) {
                return;
            }
            this.setIndex(this.items.length - 1);
        }
        setIndex(index) {
            if (index < 0 || index >= this.items.length) {
                return;
            }
            this.labels[this._index].classList.remove('active');
            this._index = index;
            this.labels[this._index].classList.add('active');
            this._onDidChange.fire();
        }
        updateCollapsed(collapsed) {
            this.collapsed = collapsed;
            for (let i = 0; i < this.labels.length; i++) {
                this.labels[i].setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            }
        }
        dispose() {
            this._onDidChange.dispose();
            this._updateLabelDisposable.dispose();
        }
    }
    exports.CompressedNavigationController = CompressedNavigationController;
    CompressedNavigationController.ID = 0;
    let FilesRenderer = class FilesRenderer {
        constructor(labels, updateWidth, contextViewService, themeService, configurationService, explorerService, labelService, contextService) {
            this.labels = labels;
            this.updateWidth = updateWidth;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.configurationService = configurationService;
            this.explorerService = explorerService;
            this.labelService = labelService;
            this.contextService = contextService;
            this.compressedNavigationControllers = new Map();
            this._onDidChangeActiveDescendant = new event_1.EventMultiplexer();
            this.onDidChangeActiveDescendant = this._onDidChangeActiveDescendant.event;
            this.config = this.configurationService.getValue();
            this.configListener = this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('explorer')) {
                    this.config = this.configurationService.getValue();
                }
            });
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        get templateId() {
            return FilesRenderer.ID;
        }
        renderTemplate(container) {
            const elementDisposable = lifecycle_1.Disposable.None;
            const label = this.labels.create(container, { supportHighlights: true });
            return { elementDisposable, label, container };
        }
        renderElement(node, index, templateData) {
            templateData.elementDisposable.dispose();
            const stat = node.element;
            const editableData = this.explorerService.getEditableData(stat);
            templateData.label.element.classList.remove('compressed');
            // File Label
            if (!editableData) {
                templateData.label.element.style.display = 'flex';
                templateData.elementDisposable = this.renderStat(stat, stat.name, undefined, node.filterData, templateData);
            }
            // Input Box
            else {
                templateData.label.element.style.display = 'none';
                templateData.elementDisposable = this.renderInputBox(templateData.container, stat, editableData);
            }
        }
        renderCompressedElements(node, index, templateData, height) {
            templateData.elementDisposable.dispose();
            const stat = node.element.elements[node.element.elements.length - 1];
            const editable = node.element.elements.filter(e => this.explorerService.isEditable(e));
            const editableData = editable.length === 0 ? undefined : this.explorerService.getEditableData(editable[0]);
            // File Label
            if (!editableData) {
                templateData.label.element.classList.add('compressed');
                templateData.label.element.style.display = 'flex';
                const disposables = new lifecycle_1.DisposableStore();
                const id = `compressed-explorer_${CompressedNavigationController.ID++}`;
                const label = node.element.elements.map(e => e.name);
                disposables.add(this.renderStat(stat, label, id, node.filterData, templateData));
                const compressedNavigationController = new CompressedNavigationController(id, node.element.elements, templateData, node.depth, node.collapsed);
                disposables.add(compressedNavigationController);
                this.compressedNavigationControllers.set(stat, compressedNavigationController);
                // accessibility
                disposables.add(this._onDidChangeActiveDescendant.add(compressedNavigationController.onDidChange));
                (0, event_2.domEvent)(templateData.container, 'mousedown')(e => {
                    const result = getIconLabelNameFromHTMLElement(e.target);
                    if (result) {
                        compressedNavigationController.setIndex(result.index);
                    }
                }, undefined, disposables);
                disposables.add((0, lifecycle_1.toDisposable)(() => this.compressedNavigationControllers.delete(stat)));
                templateData.elementDisposable = disposables;
            }
            // Input Box
            else {
                templateData.label.element.classList.remove('compressed');
                templateData.label.element.style.display = 'none';
                templateData.elementDisposable = this.renderInputBox(templateData.container, editable[0], editableData);
            }
        }
        renderStat(stat, label, domId, filterData, templateData) {
            templateData.label.element.style.display = 'flex';
            const extraClasses = ['explorer-item'];
            if (this.explorerService.isCut(stat)) {
                extraClasses.push('cut');
            }
            templateData.label.setResource({ resource: stat.resource, name: label }, {
                fileKind: stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE,
                extraClasses,
                fileDecorations: this.config.explorer.decorations,
                matches: (0, filters_1.createMatches)(filterData),
                separator: this.labelService.getSeparator(stat.resource.scheme, stat.resource.authority),
                domId
            });
            return templateData.label.onDidRender(() => {
                try {
                    this.updateWidth(stat);
                }
                catch (e) {
                    // noop since the element might no longer be in the tree, no update of width necessery
                }
            });
        }
        renderInputBox(container, stat, editableData) {
            // Use a file label only for the icon next to the input box
            const label = this.labels.create(container);
            const extraClasses = ['explorer-item', 'explorer-item-edited'];
            const fileKind = stat.isRoot ? files_1.FileKind.ROOT_FOLDER : stat.isDirectory ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const labelOptions = { hidePath: true, hideLabel: true, fileKind, extraClasses };
            const parent = stat.name ? (0, resources_1.dirname)(stat.resource) : stat.resource;
            const value = stat.name || '';
            label.setFile((0, resources_1.joinPath)(parent, value || ' '), labelOptions); // Use icon for ' ' if name is empty.
            // hack: hide label
            label.element.firstElementChild.style.display = 'none';
            // Input field for name
            const inputBox = new inputBox_1.InputBox(label.element, this.contextViewService, {
                validationOptions: {
                    validation: (value) => {
                        const message = editableData.validationMessage(value);
                        if (!message || message.severity !== notification_1.Severity.Error) {
                            return null;
                        }
                        return {
                            content: message.content,
                            formatContent: true,
                            type: 3 /* ERROR */
                        };
                    }
                },
                ariaLabel: (0, nls_1.localize)(1, null)
            });
            const styler = (0, styler_1.attachInputBoxStyler)(inputBox, this.themeService);
            const lastDot = value.lastIndexOf('.');
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value.length });
            const done = (0, functional_1.once)((success, finishEditing) => {
                label.element.style.display = 'none';
                const value = inputBox.value;
                (0, lifecycle_1.dispose)(toDispose);
                label.element.remove();
                if (finishEditing) {
                    editableData.onFinish(value, success);
                }
            });
            const showInputBoxNotification = () => {
                if (inputBox.isInputValid()) {
                    const message = editableData.validationMessage(inputBox.value);
                    if (message) {
                        inputBox.showMessage({
                            content: message.content,
                            formatContent: true,
                            type: message.severity === notification_1.Severity.Info ? 1 /* INFO */ : message.severity === notification_1.Severity.Warning ? 2 /* WARNING */ : 3 /* ERROR */
                        });
                    }
                    else {
                        inputBox.hideMessage();
                    }
                }
            };
            showInputBoxNotification();
            const toDispose = [
                inputBox,
                inputBox.onDidChange(value => {
                    label.setFile((0, resources_1.joinPath)(parent, value || ' '), labelOptions); // update label icon while typing!
                }),
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => {
                    if (e.equals(3 /* Enter */)) {
                        if (!inputBox.validate()) {
                            done(true, true);
                        }
                    }
                    else if (e.equals(9 /* Escape */)) {
                        done(false, true);
                    }
                }),
                DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_UP, (e) => {
                    showInputBoxNotification();
                }),
                DOM.addDisposableListener(inputBox.inputElement, DOM.EventType.BLUR, () => {
                    done(inputBox.isInputValid(), true);
                }),
                label,
                styler
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposable.dispose();
        }
        disposeCompressedElements(node, index, templateData) {
            templateData.elementDisposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.elementDisposable.dispose();
            templateData.label.dispose();
        }
        getCompressedNavigationController(stat) {
            return this.compressedNavigationControllers.get(stat);
        }
        // IAccessibilityProvider
        getAriaLabel(element) {
            return element.name;
        }
        getAriaLevel(element) {
            // We need to comput aria level on our own since children of compact folders will otherwise have an incorrect level	#107235
            let depth = 0;
            let parent = element.parent;
            while (parent) {
                parent = parent.parent;
                depth++;
            }
            if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
                depth = depth + 1;
            }
            return depth;
        }
        getActiveDescendantId(stat) {
            const compressedNavigationController = this.compressedNavigationControllers.get(stat);
            return compressedNavigationController === null || compressedNavigationController === void 0 ? void 0 : compressedNavigationController.currentId;
        }
        dispose() {
            this.configListener.dispose();
        }
    };
    FilesRenderer.ID = 'file';
    FilesRenderer = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, files_3.IExplorerService),
        __param(6, label_1.ILabelService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], FilesRenderer);
    exports.FilesRenderer = FilesRenderer;
    /**
     * Respectes files.exclude setting in filtering out content from the explorer.
     * Makes sure that visible editors are always shown in the explorer even if they are filtered out by settings.
     */
    let FilesFilter = class FilesFilter {
        constructor(contextService, configurationService, explorerService, editorService, uriIdentityService) {
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.uriIdentityService = uriIdentityService;
            this.hiddenExpressionPerRoot = new Map();
            this.editorsAffectingFilter = new Set();
            this._onDidChange = new event_1.Emitter();
            this.toDispose = [];
            this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(() => this.updateConfiguration()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('files.exclude')) {
                    this.updateConfiguration();
                }
            }));
            this.toDispose.push(this.editorService.onDidVisibleEditorsChange(() => {
                const editors = this.editorService.visibleEditors;
                let shouldFire = false;
                for (const e of editors) {
                    if (!e.resource) {
                        continue;
                    }
                    const stat = this.explorerService.findClosest(e.resource);
                    if (stat && stat.isExcluded) {
                        // A filtered resource suddenly became visible since user opened an editor
                        shouldFire = true;
                        break;
                    }
                }
                for (const e of this.editorsAffectingFilter) {
                    if (!editors.includes(e)) {
                        // Editor that was affecting filtering is no longer visible
                        shouldFire = true;
                        break;
                    }
                }
                if (shouldFire) {
                    this.editorsAffectingFilter.clear();
                    this._onDidChange.fire();
                }
            }));
            this.updateConfiguration();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        updateConfiguration() {
            let shouldFire = false;
            this.contextService.getWorkspace().folders.forEach(folder => {
                var _a;
                const configuration = this.configurationService.getValue({ resource: folder.uri });
                const excludesConfig = ((_a = configuration === null || configuration === void 0 ? void 0 : configuration.files) === null || _a === void 0 ? void 0 : _a.exclude) || Object.create(null);
                if (!shouldFire) {
                    const cached = this.hiddenExpressionPerRoot.get(folder.uri.toString());
                    shouldFire = !cached || !(0, objects_1.equals)(cached.original, excludesConfig);
                }
                const excludesConfigCopy = (0, objects_1.deepClone)(excludesConfig); // do not keep the config, as it gets mutated under our hoods
                this.hiddenExpressionPerRoot.set(folder.uri.toString(), { original: excludesConfigCopy, parsed: glob.parse(excludesConfigCopy) });
            });
            if (shouldFire) {
                this.editorsAffectingFilter.clear();
                this._onDidChange.fire();
            }
        }
        filter(stat, parentVisibility) {
            return this.isVisible(stat, parentVisibility);
        }
        isVisible(stat, parentVisibility) {
            var _a;
            stat.isExcluded = false;
            if (parentVisibility === 0 /* Hidden */) {
                stat.isExcluded = true;
                return false;
            }
            if (this.explorerService.getEditableData(stat)) {
                return true; // always visible
            }
            // Hide those that match Hidden Patterns
            const cached = this.hiddenExpressionPerRoot.get(stat.root.resource.toString());
            if ((cached && cached.parsed(path.relative(stat.root.resource.path, stat.resource.path), stat.name, name => !!(stat.parent && stat.parent.getChild(name)))) || ((_a = stat.parent) === null || _a === void 0 ? void 0 : _a.isExcluded)) {
                stat.isExcluded = true;
                const editors = this.editorService.visibleEditors;
                const editor = editors.find(e => e.resource && this.uriIdentityService.extUri.isEqualOrParent(e.resource, stat.resource));
                if (editor && stat.root === this.explorerService.findClosestRoot(stat.resource)) {
                    this.editorsAffectingFilter.add(editor);
                    return true; // Show all opened files and their parents
                }
                return false; // hidden through pattern
            }
            return true;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    FilesFilter = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, files_3.IExplorerService),
        __param(3, editorService_1.IEditorService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], FilesFilter);
    exports.FilesFilter = FilesFilter;
    // Explorer Sorter
    let FileSorter = class FileSorter {
        constructor(explorerService, contextService) {
            this.explorerService = explorerService;
            this.contextService = contextService;
        }
        compare(statA, statB) {
            // Do not sort roots
            if (statA.isRoot) {
                if (statB.isRoot) {
                    const workspaceA = this.contextService.getWorkspaceFolder(statA.resource);
                    const workspaceB = this.contextService.getWorkspaceFolder(statB.resource);
                    return workspaceA && workspaceB ? (workspaceA.index - workspaceB.index) : -1;
                }
                return -1;
            }
            if (statB.isRoot) {
                return 1;
            }
            const sortOrder = this.explorerService.sortOrder;
            // Sort Directories
            switch (sortOrder) {
                case 'type':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    if (statA.isDirectory && statB.isDirectory) {
                        return (0, comparers_1.compareFileNamesDefault)(statA.name, statB.name);
                    }
                    break;
                case 'filesFirst':
                    if (statA.isDirectory && !statB.isDirectory) {
                        return 1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return -1;
                    }
                    break;
                case 'mixed':
                    break; // not sorting when "mixed" is on
                default: /* 'default', 'modified' */
                    if (statA.isDirectory && !statB.isDirectory) {
                        return -1;
                    }
                    if (statB.isDirectory && !statA.isDirectory) {
                        return 1;
                    }
                    break;
            }
            // Sort Files
            switch (sortOrder) {
                case 'type':
                    return (0, comparers_1.compareFileExtensionsDefault)(statA.name, statB.name);
                case 'modified':
                    if (statA.mtime !== statB.mtime) {
                        return (statA.mtime && statB.mtime && statA.mtime < statB.mtime) ? 1 : -1;
                    }
                    return (0, comparers_1.compareFileNamesDefault)(statA.name, statB.name);
                default: /* 'default', 'mixed', 'filesFirst' */
                    return (0, comparers_1.compareFileNamesDefault)(statA.name, statB.name);
            }
        }
    };
    FileSorter = __decorate([
        __param(0, files_3.IExplorerService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], FileSorter);
    exports.FileSorter = FileSorter;
    function getFileOverwriteConfirm(name) {
        return {
            message: (0, nls_1.localize)(2, null, name),
            detail: (0, nls_1.localize)(3, null),
            primaryButton: (0, nls_1.localize)(4, null),
            type: 'warning'
        };
    }
    function getMultipleFilesOverwriteConfirm(files) {
        if (files.length > 1) {
            return {
                message: (0, nls_1.localize)(5, null, files.length),
                detail: (0, dialogs_1.getFileNamesMessage)(files) + '\n' + (0, nls_1.localize)(6, null),
                primaryButton: (0, nls_1.localize)(7, null),
                type: 'warning'
            };
        }
        return getFileOverwriteConfirm((0, resources_1.basename)(files[0]));
    }
    let FileDragAndDrop = class FileDragAndDrop {
        constructor(notificationService, explorerService, editorService, dialogService, contextService, fileService, configurationService, instantiationService, hostService, workspaceEditingService, progressService, uriIdentityService) {
            this.notificationService = notificationService;
            this.explorerService = explorerService;
            this.editorService = editorService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.fileService = fileService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.hostService = hostService;
            this.workspaceEditingService = workspaceEditingService;
            this.progressService = progressService;
            this.uriIdentityService = uriIdentityService;
            this.compressedDropTargetDisposable = lifecycle_1.Disposable.None;
            this.dropEnabled = false;
            this.toDispose = [];
            const updateDropEnablement = () => {
                this.dropEnabled = this.configurationService.getValue('explorer.enableDragAndDrop');
            };
            updateDropEnablement();
            this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => updateDropEnablement()));
        }
        onDragOver(data, target, targetIndex, originalEvent) {
            if (!this.dropEnabled) {
                return false;
            }
            // Compressed folders
            if (target) {
                const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(target, originalEvent);
                if (compressedTarget) {
                    const iconLabelName = getIconLabelNameFromHTMLElement(originalEvent.target);
                    if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
                        const result = this.handleDragOver(data, compressedTarget, targetIndex, originalEvent);
                        if (result) {
                            if (iconLabelName.element !== this.compressedDragOverElement) {
                                this.compressedDragOverElement = iconLabelName.element;
                                this.compressedDropTargetDisposable.dispose();
                                this.compressedDropTargetDisposable = (0, lifecycle_1.toDisposable)(() => {
                                    iconLabelName.element.classList.remove('drop-target');
                                    this.compressedDragOverElement = undefined;
                                });
                                iconLabelName.element.classList.add('drop-target');
                            }
                            return typeof result === 'boolean' ? result : Object.assign(Object.assign({}, result), { feedback: [] });
                        }
                        this.compressedDropTargetDisposable.dispose();
                        return false;
                    }
                }
            }
            this.compressedDropTargetDisposable.dispose();
            return this.handleDragOver(data, target, targetIndex, originalEvent);
        }
        handleDragOver(data, target, targetIndex, originalEvent) {
            const isCopy = originalEvent && ((originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh));
            const isNative = data instanceof listView_1.NativeDragAndDropData;
            const effect = (isNative || isCopy) ? 0 /* Copy */ : 1 /* Move */;
            // Native DND
            if (isNative) {
                if (!(0, dnd_1.containsDragType)(originalEvent, dnd_2.DataTransfers.FILES, dnd_1.CodeDataTransfers.FILES, dnd_2.DataTransfers.RESOURCES)) {
                    return false;
                }
            }
            // Other-Tree DND
            else if (data instanceof listView_1.ExternalElementsDragAndDropData) {
                return false;
            }
            // In-Explorer DND
            else {
                const items = FileDragAndDrop.getStatsFromDragAndDropData(data);
                if (!target) {
                    // Dropping onto the empty area. Do not accept if items dragged are already
                    // children of the root unless we are copying the file
                    if (!isCopy && items.every(i => !!i.parent && i.parent.isRoot)) {
                        return false;
                    }
                    return { accept: true, bubble: 0 /* Down */, effect, autoExpand: false };
                }
                if (!Array.isArray(items)) {
                    return false;
                }
                if (items.some((source) => {
                    if (source.isRoot && target instanceof explorerModel_1.ExplorerItem && !target.isRoot) {
                        return true; // Root folder can not be moved to a non root file stat.
                    }
                    if (this.uriIdentityService.extUri.isEqual(source.resource, target.resource)) {
                        return true; // Can not move anything onto itself
                    }
                    if (source.isRoot && target instanceof explorerModel_1.ExplorerItem && target.isRoot) {
                        // Disable moving workspace roots in one another
                        return false;
                    }
                    if (!isCopy && this.uriIdentityService.extUri.isEqual((0, resources_1.dirname)(source.resource), target.resource)) {
                        return true; // Can not move a file to the same parent unless we copy
                    }
                    if (this.uriIdentityService.extUri.isEqualOrParent(target.resource, source.resource)) {
                        return true; // Can not move a parent folder into one of its children
                    }
                    return false;
                })) {
                    return false;
                }
            }
            // All (target = model)
            if (!target) {
                return { accept: true, bubble: 0 /* Down */, effect };
            }
            // All (target = file/folder)
            else {
                if (target.isDirectory) {
                    if (target.isReadonly) {
                        return false;
                    }
                    return { accept: true, bubble: 0 /* Down */, effect, autoExpand: true };
                }
                if (this.contextService.getWorkspace().folders.every(folder => folder.uri.toString() !== target.resource.toString())) {
                    return { accept: true, bubble: 1 /* Up */, effect };
                }
            }
            return false;
        }
        getDragURI(element) {
            if (this.explorerService.isEditable(element)) {
                return null;
            }
            return element.resource.toString();
        }
        getDragLabel(elements, originalEvent) {
            if (elements.length === 1) {
                const stat = FileDragAndDrop.getCompressedStatFromDragEvent(elements[0], originalEvent);
                return stat.name;
            }
            return String(elements.length);
        }
        onDragStart(data, originalEvent) {
            const items = FileDragAndDrop.getStatsFromDragAndDropData(data, originalEvent);
            if (items && items.length && originalEvent.dataTransfer) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(dnd_1.fillResourceDataTransfers, items, undefined, originalEvent);
                // The only custom data transfer we set from the explorer is a file transfer
                // to be able to DND between multiple code file explorers across windows
                const fileResources = items.filter(s => s.resource.scheme === network_1.Schemas.file).map(r => r.resource.fsPath);
                if (fileResources.length) {
                    originalEvent.dataTransfer.setData(dnd_1.CodeDataTransfers.FILES, JSON.stringify(fileResources));
                }
            }
        }
        async drop(data, target, targetIndex, originalEvent) {
            this.compressedDropTargetDisposable.dispose();
            // Find compressed target
            if (target) {
                const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(target, originalEvent);
                if (compressedTarget) {
                    target = compressedTarget;
                }
            }
            // Find parent to add to
            if (!target) {
                target = this.explorerService.roots[this.explorerService.roots.length - 1];
            }
            if (!target.isDirectory && target.parent) {
                target = target.parent;
            }
            if (target.isReadonly) {
                return;
            }
            const resolvedTarget = target;
            if (!resolvedTarget) {
                return;
            }
            // Desktop DND (Import file)
            if (data instanceof listView_1.NativeDragAndDropData) {
                const cts = new cancellation_1.CancellationTokenSource();
                if (platform_1.isWeb) {
                    // Indicate progress globally
                    const dropPromise = this.progressService.withProgress({
                        location: 10 /* Window */,
                        delay: 800,
                        cancellable: true,
                        title: (0, nls_1.localize)(8, null)
                    }, async (progress) => {
                        try {
                            await this.handleWebExternalDrop(resolvedTarget, originalEvent, progress, cts.token);
                        }
                        catch (error) {
                            this.notificationService.warn(error);
                        }
                    }, () => cts.dispose(true));
                    // Also indicate progress in the files view
                    this.progressService.withProgress({ location: files_2.VIEW_ID, delay: 500 }, () => dropPromise);
                }
                else {
                    try {
                        await this.handleExternalDrop(resolvedTarget, originalEvent, cts.token);
                    }
                    catch (error) {
                        this.notificationService.warn(error);
                    }
                }
            }
            // In-Explorer DND (Move/Copy file)
            else {
                this.handleExplorerDrop(data, resolvedTarget, originalEvent).then(undefined, e => this.notificationService.warn(e));
            }
        }
        async handleWebExternalDrop(target, originalEvent, progress, token) {
            const items = originalEvent.dataTransfer.items;
            // Somehow the items thing is being modified at random, maybe as a security
            // measure since this is a DND operation. As such, we copy the items into
            // an array we own as early as possible before using it.
            const entries = [];
            for (const item of items) {
                entries.push(item.webkitGetAsEntry());
            }
            const results = [];
            const operation = {
                startTime: Date.now(),
                progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                filesTotal: entries.length,
                filesUploaded: 0,
                totalBytesUploaded: 0
            };
            for (let entry of entries) {
                if (token.isCancellationRequested) {
                    break;
                }
                // Confirm overwrite as needed
                if (target && entry.name && target.getChild(entry.name)) {
                    const { confirmed } = await this.dialogService.confirm(getFileOverwriteConfirm(entry.name));
                    if (!confirmed) {
                        continue;
                    }
                    await this.explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit((0, resources_1.joinPath)(target.resource, entry.name), undefined, { recursive: true })], {
                        undoLabel: (0, nls_1.localize)(9, null, entry.name),
                        progressLabel: (0, nls_1.localize)(10, null, entry.name),
                    });
                    if (token.isCancellationRequested) {
                        break;
                    }
                }
                // Upload entry
                const result = await this.doUploadWebFileEntry(entry, target.resource, target, progress, operation, token);
                if (result) {
                    results.push(result);
                }
            }
            operation.progressScheduler.dispose();
            // Open uploaded file in editor only if we upload just one
            const firstUploadedFile = results[0];
            if (!token.isCancellationRequested && (firstUploadedFile === null || firstUploadedFile === void 0 ? void 0 : firstUploadedFile.isFile)) {
                await this.editorService.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
            }
        }
        async doUploadWebFileEntry(entry, parentResource, target, progress, operation, token) {
            if (token.isCancellationRequested || !entry.name || (!entry.isFile && !entry.isDirectory)) {
                return undefined;
            }
            // Report progress
            let fileBytesUploaded = 0;
            const reportProgress = (fileSize, bytesUploaded) => {
                fileBytesUploaded += bytesUploaded;
                operation.totalBytesUploaded += bytesUploaded;
                const bytesUploadedPerSecond = operation.totalBytesUploaded / ((Date.now() - operation.startTime) / 1000);
                // Small file
                let message;
                if (fileSize < files_1.ByteSize.MB) {
                    if (operation.filesTotal === 1) {
                        message = `${entry.name}`;
                    }
                    else {
                        message = (0, nls_1.localize)(11, null, operation.filesUploaded, operation.filesTotal, files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                    }
                }
                // Large file
                else {
                    message = (0, nls_1.localize)(12, null, entry.name, files_1.ByteSize.formatSize(fileBytesUploaded), files_1.ByteSize.formatSize(fileSize), files_1.ByteSize.formatSize(bytesUploadedPerSecond));
                }
                // Report progress but limit to update only once per second
                operation.progressScheduler.work({ message });
            };
            operation.filesUploaded++;
            reportProgress(0, 0);
            // Handle file upload
            const resource = (0, resources_1.joinPath)(parentResource, entry.name);
            if (entry.isFile) {
                const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Chrome/Edge/Firefox support stream method, but only use it for
                // larger files to reduce the overhead of the streaming approach
                if (typeof file.stream === 'function' && file.size > files_1.ByteSize.MB) {
                    await this.doUploadWebFileEntryBuffered(resource, file, reportProgress, token);
                }
                // Fallback to unbuffered upload for other browsers or small files
                else {
                    await this.doUploadWebFileEntryUnbuffered(resource, file, reportProgress);
                }
                return { isFile: true, resource };
            }
            // Handle folder upload
            else {
                // Create target folder
                await this.fileService.createFolder(resource);
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // Recursive upload files in this directory
                const dirReader = entry.createReader();
                const childEntries = [];
                let done = false;
                do {
                    const childEntriesChunk = await new Promise((resolve, reject) => dirReader.readEntries(resolve, reject));
                    if (childEntriesChunk.length > 0) {
                        childEntries.push(...childEntriesChunk);
                    }
                    else {
                        done = true; // an empty array is a signal that all entries have been read
                    }
                } while (!done && !token.isCancellationRequested);
                // Update operation total based on new counts
                operation.filesTotal += childEntries.length;
                // Upload all entries as files to target
                const folderTarget = target && target.getChild(entry.name) || undefined;
                for (let childEntry of childEntries) {
                    await this.doUploadWebFileEntry(childEntry, resource, folderTarget, progress, operation, token);
                }
                return { isFile: false, resource };
            }
        }
        async doUploadWebFileEntryBuffered(resource, file, progressReporter, token) {
            const writeableStream = (0, buffer_1.newWriteableBufferStream)({
                // Set a highWaterMark to prevent the stream
                // for file upload to produce large buffers
                // in-memory
                highWaterMark: 10
            });
            const writeFilePromise = this.fileService.writeFile(resource, writeableStream);
            // Read the file in chunks using File.stream() web APIs
            try {
                const reader = file.stream().getReader();
                let res = await reader.read();
                while (!res.done) {
                    if (token.isCancellationRequested) {
                        return undefined;
                    }
                    // Write buffer into stream but make sure to wait
                    // in case the highWaterMark is reached
                    const buffer = buffer_1.VSBuffer.wrap(res.value);
                    await writeableStream.write(buffer);
                    if (token.isCancellationRequested) {
                        return undefined;
                    }
                    // Report progress
                    progressReporter(file.size, buffer.byteLength);
                    res = await reader.read();
                }
                writeableStream.end(undefined);
            }
            catch (error) {
                writeableStream.error(error);
                writeableStream.end();
            }
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Wait for file being written to target
            await writeFilePromise;
        }
        doUploadWebFileEntryUnbuffered(resource, file, progressReporter) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    var _a;
                    try {
                        if (((_a = event.target) === null || _a === void 0 ? void 0 : _a.result) instanceof ArrayBuffer) {
                            const buffer = buffer_1.VSBuffer.wrap(new Uint8Array(event.target.result));
                            await this.fileService.writeFile(resource, buffer);
                            // Report progress
                            progressReporter(file.size, buffer.byteLength);
                        }
                        else {
                            throw new Error('Could not read from dropped file.');
                        }
                        resolve();
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                // Start reading the file to trigger `onload`
                reader.readAsArrayBuffer(file);
            });
        }
        async handleExternalDrop(target, originalEvent, token) {
            // Check for dropped external files to be folders
            const droppedResources = (0, dnd_1.extractResources)(originalEvent, true);
            const result = await this.fileService.resolveAll(droppedResources.map(droppedResource => ({ resource: droppedResource.resource })));
            if (token.isCancellationRequested) {
                return;
            }
            // Pass focus to window
            this.hostService.focus();
            // Handle folders by adding to workspace if we are in workspace context and if dropped on top
            const folders = result.filter(r => r.success && r.stat && r.stat.isDirectory).map(result => ({ uri: result.stat.resource }));
            if (folders.length > 0 && target.isRoot) {
                const buttons = [
                    folders.length > 1 ? (0, nls_1.localize)(13, null) : (0, nls_1.localize)(14, null),
                    (0, nls_1.localize)(15, null)
                ];
                const workspaceFolderSchemas = this.contextService.getWorkspace().folders.map(f => f.uri.scheme);
                let message = folders.length > 1 ? (0, nls_1.localize)(16, null) : (0, nls_1.localize)(17, null, (0, resources_1.basename)(folders[0].uri));
                if (folders.some(f => workspaceFolderSchemas.indexOf(f.uri.scheme) >= 0)) {
                    // We only allow to add a folder to the workspace if there is already a workspace folder with that scheme
                    buttons.unshift(folders.length > 1 ? (0, nls_1.localize)(18, null) : (0, nls_1.localize)(19, null));
                    message = folders.length > 1 ? (0, nls_1.localize)(20, null)
                        : (0, nls_1.localize)(21, null, (0, resources_1.basename)(folders[0].uri));
                }
                const { choice } = await this.dialogService.show(notification_1.Severity.Info, message, buttons);
                if (choice === buttons.length - 3) {
                    return this.workspaceEditingService.addFolders(folders);
                }
                if (choice === buttons.length - 2) {
                    return this.addResources(target, droppedResources.map(res => res.resource), token);
                }
                return undefined;
            }
            // Handle dropped files (only support FileStat as target)
            else if (target instanceof explorerModel_1.ExplorerItem) {
                return this.addResources(target, droppedResources.map(res => res.resource), token);
            }
        }
        async addResources(target, resources, token) {
            if (resources && resources.length > 0) {
                // Resolve target to check for name collisions and ask user
                const targetStat = await this.fileService.resolve(target.resource);
                if (token.isCancellationRequested) {
                    return;
                }
                // Check for name collisions
                const targetNames = new Set();
                const caseSensitive = this.fileService.hasCapability(target.resource, 1024 /* PathCaseSensitive */);
                if (targetStat.children) {
                    targetStat.children.forEach(child => {
                        targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
                    });
                }
                const resourcesFiltered = (await Promise.all(resources.map(async (resource) => {
                    if (targetNames.has(caseSensitive ? (0, resources_1.basename)(resource) : (0, resources_1.basename)(resource).toLowerCase())) {
                        const confirmationResult = await this.dialogService.confirm(getFileOverwriteConfirm((0, resources_1.basename)(resource)));
                        if (!confirmationResult.confirmed) {
                            return undefined;
                        }
                    }
                    return resource;
                }))).filter(r => r instanceof uri_1.URI);
                const resourceFileEdits = resourcesFiltered.map(resource => {
                    const sourceFileName = (0, resources_1.basename)(resource);
                    const targetFile = (0, resources_1.joinPath)(target.resource, sourceFileName);
                    return new bulkEditService_1.ResourceFileEdit(resource, targetFile, { overwrite: true, copy: true });
                });
                await this.explorerService.applyBulkEdit(resourceFileEdits, {
                    undoLabel: resourcesFiltered.length === 1 ? (0, nls_1.localize)(22, null, (0, resources_1.basename)(resourcesFiltered[0])) : (0, nls_1.localize)(23, null, resourcesFiltered.length),
                    progressLabel: resourcesFiltered.length === 1 ? (0, nls_1.localize)(24, null, (0, resources_1.basename)(resourcesFiltered[0])) : (0, nls_1.localize)(25, null, resourcesFiltered.length)
                });
                // if we only add one file, just open it directly
                if (resourceFileEdits.length === 1) {
                    const item = this.explorerService.findClosest(resourceFileEdits[0].newResource);
                    if (item && !item.isDirectory) {
                        this.editorService.openEditor({ resource: item.resource, options: { pinned: true } });
                    }
                }
            }
        }
        async handleExplorerDrop(data, target, originalEvent) {
            const elementsData = FileDragAndDrop.getStatsFromDragAndDropData(data);
            const items = (0, resources_1.distinctParents)(elementsData, s => s.resource);
            const isCopy = (originalEvent.ctrlKey && !platform_1.isMacintosh) || (originalEvent.altKey && platform_1.isMacintosh);
            // Handle confirm setting
            const confirmDragAndDrop = !isCopy && this.configurationService.getValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY);
            if (confirmDragAndDrop) {
                const message = items.length > 1 && items.every(s => s.isRoot) ? (0, nls_1.localize)(26, null)
                    : items.length > 1 ? (0, nls_1.localize)(27, null, items.length, target.name)
                        : items[0].isRoot ? (0, nls_1.localize)(28, null, items[0].name)
                            : (0, nls_1.localize)(29, null, items[0].name, target.name);
                const detail = items.length > 1 && !items.every(s => s.isRoot) ? (0, dialogs_1.getFileNamesMessage)(items.map(i => i.resource)) : undefined;
                const confirmation = await this.dialogService.confirm({
                    message,
                    detail,
                    checkbox: {
                        label: (0, nls_1.localize)(30, null)
                    },
                    type: 'question',
                    primaryButton: (0, nls_1.localize)(31, null)
                });
                if (!confirmation.confirmed) {
                    return;
                }
                // Check for confirmation checkbox
                if (confirmation.checkboxChecked === true) {
                    await this.configurationService.updateValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY, false);
                }
            }
            await this.doHandleRootDrop(items.filter(s => s.isRoot), target);
            const sources = items.filter(s => !s.isRoot);
            if (isCopy) {
                await this.doHandleExplorerDropOnCopy(sources, target);
            }
            else {
                return this.doHandleExplorerDropOnMove(sources, target);
            }
        }
        doHandleRootDrop(roots, target) {
            if (roots.length === 0) {
                return Promise.resolve(undefined);
            }
            const folders = this.contextService.getWorkspace().folders;
            let targetIndex;
            const workspaceCreationData = [];
            const rootsToMove = [];
            for (let index = 0; index < folders.length; index++) {
                const data = {
                    uri: folders[index].uri,
                    name: folders[index].name
                };
                if (target instanceof explorerModel_1.ExplorerItem && this.uriIdentityService.extUri.isEqual(folders[index].uri, target.resource)) {
                    targetIndex = index;
                }
                if (roots.every(r => r.resource.toString() !== folders[index].uri.toString())) {
                    workspaceCreationData.push(data);
                }
                else {
                    rootsToMove.push(data);
                }
            }
            if (targetIndex === undefined) {
                targetIndex = workspaceCreationData.length;
            }
            workspaceCreationData.splice(targetIndex, 0, ...rootsToMove);
            return this.workspaceEditingService.updateFolders(0, workspaceCreationData.length, workspaceCreationData);
        }
        async doHandleExplorerDropOnCopy(sources, target) {
            // Reuse duplicate action when user copies
            const incrementalNaming = this.configurationService.getValue().explorer.incrementalNaming;
            const resourceFileEdits = sources.map(({ resource, isDirectory }) => (new bulkEditService_1.ResourceFileEdit(resource, (0, fileActions_1.findValidPasteFileTarget)(this.explorerService, target, { resource, isDirectory, allowOverwrite: false }, incrementalNaming), { copy: true })));
            const labelSufix = getFileOrFolderLabelSufix(sources);
            await this.explorerService.applyBulkEdit(resourceFileEdits, {
                undoLabel: (0, nls_1.localize)(32, null, labelSufix),
                progressLabel: (0, nls_1.localize)(33, null, labelSufix),
            });
            const editors = resourceFileEdits.filter(edit => {
                const item = edit.newResource ? this.explorerService.findClosest(edit.newResource) : undefined;
                return item && !item.isDirectory;
            }).map(edit => ({ resource: edit.newResource, options: { pinned: true } }));
            await this.editorService.openEditors(editors);
        }
        async doHandleExplorerDropOnMove(sources, target) {
            // Do not allow moving readonly items
            const resourceFileEdits = sources.filter(source => !source.isReadonly).map(source => new bulkEditService_1.ResourceFileEdit(source.resource, (0, resources_1.joinPath)(target.resource, source.name)));
            const labelSufix = getFileOrFolderLabelSufix(sources);
            const options = {
                undoLabel: (0, nls_1.localize)(34, null, labelSufix),
                progressLabel: (0, nls_1.localize)(35, null, labelSufix)
            };
            try {
                await this.explorerService.applyBulkEdit(resourceFileEdits, options);
            }
            catch (error) {
                // Conflict
                if (error.fileOperationResult === 4 /* FILE_MOVE_CONFLICT */) {
                    const overwrites = [];
                    for (const edit of resourceFileEdits) {
                        if (edit.newResource && await this.fileService.exists(edit.newResource)) {
                            overwrites.push(edit.newResource);
                        }
                    }
                    const confirm = getMultipleFilesOverwriteConfirm(overwrites);
                    // Move with overwrite if the user confirms
                    const { confirmed } = await this.dialogService.confirm(confirm);
                    if (confirmed) {
                        try {
                            await this.explorerService.applyBulkEdit(resourceFileEdits.map(re => new bulkEditService_1.ResourceFileEdit(re.oldResource, re.newResource, { overwrite: true })), options);
                        }
                        catch (error) {
                            this.notificationService.error(error);
                        }
                    }
                }
                // Any other error
                else {
                    this.notificationService.error(error);
                }
            }
        }
        static getStatsFromDragAndDropData(data, dragStartEvent) {
            if (data.context) {
                return data.context;
            }
            // Detect compressed folder dragging
            if (dragStartEvent && data.elements.length === 1) {
                data.context = [FileDragAndDrop.getCompressedStatFromDragEvent(data.elements[0], dragStartEvent)];
                return data.context;
            }
            return data.elements;
        }
        static getCompressedStatFromDragEvent(stat, dragEvent) {
            const target = document.elementFromPoint(dragEvent.clientX, dragEvent.clientY);
            const iconLabelName = getIconLabelNameFromHTMLElement(target);
            if (iconLabelName) {
                const { count, index } = iconLabelName;
                let i = count - 1;
                while (i > index && stat.parent) {
                    stat = stat.parent;
                    i--;
                }
                return stat;
            }
            return stat;
        }
        onDragEnd() {
            this.compressedDropTargetDisposable.dispose();
        }
    };
    FileDragAndDrop.CONFIRM_DND_SETTING_KEY = 'explorer.confirmDragAndDrop';
    FileDragAndDrop = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, files_3.IExplorerService),
        __param(2, editorService_1.IEditorService),
        __param(3, dialogs_1.IDialogService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, files_1.IFileService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, host_1.IHostService),
        __param(9, workspaceEditing_1.IWorkspaceEditingService),
        __param(10, progress_1.IProgressService),
        __param(11, uriIdentity_1.IUriIdentityService)
    ], FileDragAndDrop);
    exports.FileDragAndDrop = FileDragAndDrop;
    function getIconLabelNameFromHTMLElement(target) {
        if (!(target instanceof HTMLElement)) {
            return null;
        }
        let element = target;
        while (element && !element.classList.contains('monaco-list-row')) {
            if (element.classList.contains('label-name') && element.hasAttribute('data-icon-label-count')) {
                const count = Number(element.getAttribute('data-icon-label-count'));
                const index = Number(element.getAttribute('data-icon-label-index'));
                if ((0, types_1.isNumber)(count) && (0, types_1.isNumber)(index)) {
                    return { element: element, count, index };
                }
            }
            element = element.parentElement;
        }
        return null;
    }
    function isCompressedFolderName(target) {
        return !!getIconLabelNameFromHTMLElement(target);
    }
    exports.isCompressedFolderName = isCompressedFolderName;
    class ExplorerCompressionDelegate {
        isIncompressible(stat) {
            return stat.isRoot || !stat.isDirectory || stat instanceof explorerModel_1.NewExplorerItem || (!stat.parent || stat.parent.isRoot);
        }
    }
    exports.ExplorerCompressionDelegate = ExplorerCompressionDelegate;
    function getFileOrFolderLabelSufix(items) {
        if (items.length === 1) {
            return items[0].name;
        }
        if (items.every(i => i.isDirectory)) {
            return `${items.length} folders`;
        }
        if (items.every(i => !i.isDirectory)) {
            return `${items.length} files`;
        }
        return `${items.length} files and folders`;
    }
});
//# sourceMappingURL=explorerViewer.js.map