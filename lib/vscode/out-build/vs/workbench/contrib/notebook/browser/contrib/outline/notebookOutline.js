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
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/outline/browser/outline", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/getIconClasses", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/platform/markers/common/markers", "vs/platform/theme/common/colorRegistry", "vs/base/common/resources", "vs/base/common/async", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/marked/marked", "vs/base/browser/markdownRenderer", "vs/css!./notebookOutline"], function (require, exports, codicons_1, event_1, lifecycle_1, themeService_1, notebookEditor_1, notebookCommon_1, outline_1, contributions_1, platform_1, filters_1, iconLabel_1, editorService_1, instantiation_1, getIconClasses_1, nls_1, markers_1, colorRegistry_1, resources_1, async_1, configuration_1, configurationRegistry_1, marked, markdownRenderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellOutline = exports.OutlineEntry = void 0;
    class OutlineEntry {
        constructor(index, level, cell, label, icon) {
            this.index = index;
            this.level = level;
            this.cell = cell;
            this.label = label;
            this.icon = icon;
            this._children = [];
        }
        addChild(entry) {
            this._children.push(entry);
            entry._parent = this;
        }
        get parent() {
            return this._parent;
        }
        get children() {
            return this._children;
        }
        get markerInfo() {
            return this._markerInfo;
        }
        updateMarkers(markerService) {
            var _a, _b;
            if (this.cell.cellKind === notebookCommon_1.CellKind.Code) {
                // a code cell can have marker
                const marker = markerService.read({ resource: this.cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                if (marker.length === 0) {
                    this._markerInfo = undefined;
                }
                else {
                    const topSev = (_b = (_a = marker.find(a => a.severity === markers_1.MarkerSeverity.Error)) === null || _a === void 0 ? void 0 : _a.severity) !== null && _b !== void 0 ? _b : markers_1.MarkerSeverity.Warning;
                    this._markerInfo = { topSev, count: marker.length };
                }
            }
            else {
                // a markdown cell can inherit markers from its children
                let topChild;
                for (let child of this.children) {
                    child.updateMarkers(markerService);
                    if (child.markerInfo) {
                        topChild = !topChild ? child.markerInfo.topSev : Math.max(child.markerInfo.topSev, topChild);
                    }
                }
                this._markerInfo = topChild && { topSev: topChild, count: 0 };
            }
        }
        clearMarkers() {
            this._markerInfo = undefined;
            for (let child of this.children) {
                child.clearMarkers();
            }
        }
        find(cell, parents) {
            if (cell.id === this.cell.id) {
                return this;
            }
            parents.push(this);
            for (let child of this.children) {
                const result = child.find(cell, parents);
                if (result) {
                    return result;
                }
            }
            parents.pop();
            return undefined;
        }
        asFlatList(bucket) {
            bucket.push(this);
            for (let child of this.children) {
                child.asFlatList(bucket);
            }
        }
    }
    exports.OutlineEntry = OutlineEntry;
    class NotebookOutlineTemplate {
        constructor(container, iconClass, iconLabel, decoration) {
            this.container = container;
            this.iconClass = iconClass;
            this.iconLabel = iconLabel;
            this.decoration = decoration;
        }
    }
    NotebookOutlineTemplate.templateId = 'NotebookOutlineRenderer';
    let NotebookOutlineRenderer = class NotebookOutlineRenderer {
        constructor(_themeService, _configurationService) {
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this.templateId = NotebookOutlineTemplate.templateId;
        }
        renderTemplate(container) {
            container.classList.add('notebook-outline-element', 'show-file-icons');
            const iconClass = document.createElement('div');
            container.append(iconClass);
            const iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            const decoration = document.createElement('div');
            decoration.className = 'element-decoration';
            container.append(decoration);
            return new NotebookOutlineTemplate(container, iconClass, iconLabel, decoration);
        }
        renderElement(node, _index, template, _height) {
            var _a, _b, _c, _d;
            const options = {
                matches: (0, filters_1.createMatches)(node.filterData),
                extraClasses: []
            };
            if (node.element.cell.cellKind === notebookCommon_1.CellKind.Code && this._themeService.getFileIconTheme().hasFileIcons) {
                template.iconClass.className = '';
                (_a = options.extraClasses) === null || _a === void 0 ? void 0 : _a.push(...(0, getIconClasses_1.getIconClassesForModeId)((_b = node.element.cell.language) !== null && _b !== void 0 ? _b : ''));
            }
            else {
                template.iconClass.className = 'element-icon ' + themeService_1.ThemeIcon.asClassNameArray(node.element.icon).join(' ');
            }
            template.iconLabel.setLabel(node.element.label, undefined, options);
            const { markerInfo } = node.element;
            template.container.style.removeProperty('--outline-element-color');
            template.decoration.innerText = '';
            if (markerInfo) {
                const useBadges = this._configurationService.getValue("outline.problems.badges" /* problemsBadges */);
                if (!useBadges) {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = '';
                }
                else if (markerInfo.count === 0) {
                    template.decoration.classList.add('bubble');
                    template.decoration.innerText = '\uea71';
                }
                else {
                    template.decoration.classList.remove('bubble');
                    template.decoration.innerText = markerInfo.count > 9 ? '9+' : String(markerInfo.count);
                }
                const color = this._themeService.getColorTheme().getColor(markerInfo.topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground);
                const useColors = this._configurationService.getValue("outline.problems.colors" /* problemsColors */);
                if (!useColors) {
                    template.container.style.removeProperty('--outline-element-color');
                    template.decoration.style.setProperty('--outline-element-color', (_c = color === null || color === void 0 ? void 0 : color.toString()) !== null && _c !== void 0 ? _c : 'inherit');
                }
                else {
                    template.container.style.setProperty('--outline-element-color', (_d = color === null || color === void 0 ? void 0 : color.toString()) !== null && _d !== void 0 ? _d : 'inherit');
                }
            }
        }
        disposeTemplate(templateData) {
            templateData.iconLabel.dispose();
        }
    };
    NotebookOutlineRenderer = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, configuration_1.IConfigurationService)
    ], NotebookOutlineRenderer);
    class NotebookOutlineAccessibility {
        getAriaLabel(element) {
            return element.label;
        }
        getWidgetAriaLabel() {
            return '';
        }
    }
    class NotebookNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element.label;
        }
    }
    class NotebookOutlineVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return NotebookOutlineTemplate.templateId;
        }
    }
    let NotebookQuickPickProvider = class NotebookQuickPickProvider {
        constructor(_getEntries, _themeService) {
            this._getEntries = _getEntries;
            this._themeService = _themeService;
        }
        getQuickPickElements() {
            var _a;
            const bucket = [];
            for (let entry of this._getEntries()) {
                entry.asFlatList(bucket);
            }
            const result = [];
            const { hasFileIcons } = this._themeService.getFileIconTheme();
            for (let element of bucket) {
                // todo@jrieken it is fishy that codicons cannot be used with iconClasses
                // but file icons can...
                result.push({
                    element,
                    label: hasFileIcons ? element.label : `$(${element.icon.id}) ${element.label}`,
                    ariaLabel: element.label,
                    iconClasses: hasFileIcons ? (0, getIconClasses_1.getIconClassesForModeId)((_a = element.cell.language) !== null && _a !== void 0 ? _a : '') : undefined,
                });
            }
            return result;
        }
    };
    NotebookQuickPickProvider = __decorate([
        __param(1, themeService_1.IThemeService)
    ], NotebookQuickPickProvider);
    class NotebookComparator {
        constructor() {
            this._collator = new async_1.IdleValue(() => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            return a.index - b.index;
        }
        compareByType(a, b) {
            return a.cell.cellKind - b.cell.cellKind || this._collator.value.compare(a.label, b.label);
        }
        compareByName(a, b) {
            return this._collator.value.compare(a.label, b.label);
        }
    }
    let NotebookCellOutline = class NotebookCellOutline {
        constructor(_editor, _target, instantiationService, themeService, _editorService, _markerService, _configurationService) {
            this._editor = _editor;
            this._target = _target;
            this._editorService = _editorService;
            this._markerService = _markerService;
            this._configurationService = _configurationService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._entries = [];
            this._entriesDisposables = new lifecycle_1.DisposableStore();
            this.outlineKind = 'notebookCells';
            const selectionListener = new lifecycle_1.MutableDisposable();
            this._dispoables.add(selectionListener);
            const installSelectionListener = () => {
                if (!_editor.viewModel) {
                    selectionListener.clear();
                }
                else {
                    selectionListener.value = (0, lifecycle_1.combinedDisposable)(_editor.viewModel.onDidChangeSelection(() => this._recomputeActive()), _editor.viewModel.onDidChangeViewCells(() => this._recomputeState()));
                }
            };
            this._dispoables.add(_editor.onDidChangeModel(() => {
                this._recomputeState();
                installSelectionListener();
            }));
            this._dispoables.add(_configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.outline.showCodeCells')) {
                    this._recomputeState();
                }
            }));
            this._dispoables.add(themeService.onDidFileIconThemeChange(() => {
                this._onDidChange.fire({});
            }));
            this._recomputeState();
            installSelectionListener();
            const options = {
                collapseByDefault: _target === 2 /* Breadcrumbs */,
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                accessibilityProvider: new NotebookOutlineAccessibility(),
                identityProvider: { getId: element => element.cell.id },
                keyboardNavigationLabelProvider: new NotebookNavigationLabelProvider()
            };
            const treeDataSource = { getChildren: parent => parent instanceof NotebookCellOutline ? this._entries : parent.children };
            const delegate = new NotebookOutlineVirtualDelegate();
            const renderers = [instantiationService.createInstance(NotebookOutlineRenderer)];
            const comparator = new NotebookComparator();
            this.config = {
                breadcrumbsDataSource: {
                    getBreadcrumbElements: () => {
                        let result = [];
                        let candidate = this._activeEntry;
                        while (candidate) {
                            result.unshift(candidate);
                            candidate = candidate.parent;
                        }
                        return result;
                    }
                },
                quickPickDataSource: instantiationService.createInstance(NotebookQuickPickProvider, () => this._entries),
                treeDataSource,
                delegate,
                renderers,
                comparator,
                options
            };
        }
        get activeElement() {
            return this._activeEntry;
        }
        dispose() {
            this._onDidChange.dispose();
            this._dispoables.dispose();
            this._entriesDisposables.dispose();
        }
        _recomputeState() {
            var _a;
            this._entriesDisposables.clear();
            this._activeEntry = undefined;
            this._entries.length = 0;
            const { viewModel } = this._editor;
            if (!viewModel) {
                return;
            }
            let includeCodeCells = true;
            if (this._target === 1 /* OutlinePane */) {
                includeCodeCells = this._configurationService.getValue('notebook.outline.showCodeCells');
            }
            else if (this._target === 2 /* Breadcrumbs */) {
                includeCodeCells = this._configurationService.getValue('notebook.breadcrumbs.showCodeCells');
            }
            const focusedCellIndex = viewModel.getFocus().start;
            const focused = (_a = viewModel.cellAt(focusedCellIndex)) === null || _a === void 0 ? void 0 : _a.handle;
            const entries = [];
            for (let i = 0; i < viewModel.length; i++) {
                const cell = viewModel.viewCells[i];
                const isMarkdown = cell.cellKind === notebookCommon_1.CellKind.Markdown;
                if (!isMarkdown && !includeCodeCells) {
                    continue;
                }
                // The cap the amount of characters that we look at and use the following logic
                // - for MD prefer headings (each header is an entry)
                // - otherwise use the first none-empty line of the cell (MD or code)
                let content = cell.getText().substr(0, 10000);
                let hasHeader = false;
                if (isMarkdown) {
                    for (const token of marked.lexer(content, { gfm: true })) {
                        if (token.type === 'heading') {
                            hasHeader = true;
                            entries.push(new OutlineEntry(entries.length, token.depth, cell, (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: token.text }).trim(), codicons_1.Codicon.markdown));
                        }
                    }
                    if (!hasHeader) {
                        content = (0, markdownRenderer_1.renderMarkdownAsPlaintext)({ value: content });
                    }
                }
                if (!hasHeader) {
                    const lineMatch = content.match(/^.*\w+.*\w*$/m);
                    let preview;
                    if (!lineMatch) {
                        preview = (0, nls_1.localize)(0, null);
                    }
                    else {
                        preview = lineMatch[0].trim();
                        if (preview.length >= 64) {
                            preview = preview.slice(0, 64) + '…';
                        }
                    }
                    entries.push(new OutlineEntry(entries.length, 7, cell, preview, isMarkdown ? codicons_1.Codicon.markdown : codicons_1.Codicon.code));
                }
                if (cell.handle === focused) {
                    this._activeEntry = entries[entries.length - 1];
                }
                // send an event whenever any of the cells change
                this._entriesDisposables.add(cell.model.onDidChangeContent(() => {
                    this._recomputeState();
                    this._onDidChange.fire({});
                }));
            }
            // build a tree from the list of entries
            if (entries.length > 0) {
                let result = [entries[0]];
                let parentStack = [entries[0]];
                for (let i = 1; i < entries.length; i++) {
                    let entry = entries[i];
                    while (true) {
                        const len = parentStack.length;
                        if (len === 0) {
                            // root node
                            result.push(entry);
                            parentStack.push(entry);
                            break;
                        }
                        else {
                            let parentCandidate = parentStack[len - 1];
                            if (parentCandidate.level < entry.level) {
                                parentCandidate.addChild(entry);
                                parentStack.push(entry);
                                break;
                            }
                            else {
                                parentStack.pop();
                            }
                        }
                    }
                }
                this._entries = result;
            }
            // feature: show markers with each cell
            const markerServiceListener = new lifecycle_1.MutableDisposable();
            this._entriesDisposables.add(markerServiceListener);
            const updateMarkerUpdater = () => {
                const doUpdateMarker = (clear) => {
                    for (let entry of this._entries) {
                        if (clear) {
                            entry.clearMarkers();
                        }
                        else {
                            entry.updateMarkers(this._markerService);
                        }
                    }
                };
                if (this._configurationService.getValue("outline.problems.enabled" /* problemsEnabled */)) {
                    markerServiceListener.value = this._markerService.onMarkerChanged(e => {
                        if (e.some(uri => viewModel.viewCells.some(cell => (0, resources_1.isEqual)(cell.uri, uri)))) {
                            doUpdateMarker(false);
                            this._onDidChange.fire({});
                        }
                    });
                    doUpdateMarker(false);
                }
                else {
                    markerServiceListener.clear();
                    doUpdateMarker(true);
                }
            };
            updateMarkerUpdater();
            this._entriesDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("outline.problems.enabled" /* problemsEnabled */)) {
                    updateMarkerUpdater();
                    this._onDidChange.fire({});
                }
            }));
            this._onDidChange.fire({});
        }
        _recomputeActive() {
            let newActive;
            const { viewModel } = this._editor;
            if (viewModel) {
                const cell = viewModel.cellAt(viewModel.getFocus().start);
                if (cell) {
                    for (let entry of this._entries) {
                        newActive = entry.find(cell, []);
                        if (newActive) {
                            break;
                        }
                    }
                }
            }
            if (newActive !== this._activeEntry) {
                this._activeEntry = newActive;
                this._onDidChange.fire({ affectOnlyActiveElement: true });
            }
        }
        get isEmpty() {
            return this._entries.length === 0;
        }
        async reveal(entry, options, sideBySide) {
            await this._editorService.openEditor({
                resource: entry.cell.uri,
                options,
            }, sideBySide ? editorService_1.SIDE_GROUP : undefined);
        }
        preview(entry) {
            const widget = this._editor.getControl();
            if (!widget) {
                return lifecycle_1.Disposable.None;
            }
            widget.revealInCenterIfOutsideViewport(entry.cell);
            const ids = widget.deltaCellDecorations([], [{
                    handle: entry.cell.handle,
                    options: { className: 'nb-symbolHighlight', outputClassName: 'nb-symbolHighlight' }
                }]);
            return (0, lifecycle_1.toDisposable)(() => { widget.deltaCellDecorations(ids, []); });
        }
        captureViewState() {
            const widget = this._editor.getControl();
            let viewState = widget === null || widget === void 0 ? void 0 : widget.getEditorViewState();
            return (0, lifecycle_1.toDisposable)(() => {
                if (viewState) {
                    widget === null || widget === void 0 ? void 0 : widget.restoreListViewState(viewState);
                }
            });
        }
    };
    NotebookCellOutline = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, themeService_1.IThemeService),
        __param(4, editorService_1.IEditorService),
        __param(5, markers_1.IMarkerService),
        __param(6, configuration_1.IConfigurationService)
    ], NotebookCellOutline);
    exports.NotebookCellOutline = NotebookCellOutline;
    let NotebookOutlineCreator = class NotebookOutlineCreator {
        constructor(outlineService, _instantiationService) {
            this._instantiationService = _instantiationService;
            const reg = outlineService.registerOutlineCreator(this);
            this.dispose = () => reg.dispose();
        }
        matches(candidate) {
            return candidate.getId() === notebookEditor_1.NotebookEditor.ID;
        }
        async createOutline(editor, target) {
            return this._instantiationService.createInstance(NotebookCellOutline, editor, target);
        }
    };
    NotebookOutlineCreator = __decorate([
        __param(0, outline_1.IOutlineService),
        __param(1, instantiation_1.IInstantiationService)
    ], NotebookOutlineCreator);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(NotebookOutlineCreator, 4 /* Eventually */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.outline.showCodeCells': {
                type: 'boolean',
                default: false,
                markdownDescription: (0, nls_1.localize)(1, null)
            },
            'notebook.breadcrumbs.showCodeCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(2, null)
            },
        }
    });
});
//# sourceMappingURL=notebookOutline.js.map