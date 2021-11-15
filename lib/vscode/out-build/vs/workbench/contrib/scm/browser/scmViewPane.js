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
define(["require", "exports", "vs/base/common/event", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/workbench/browser/labels", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/base/common/actions", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/theme/common/themeService", "./util", "vs/platform/theme/common/styler", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/base/common/resourceTree", "vs/base/common/iterator", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/comparers", "vs/base/common/filters", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/scm/browser/scmViewPane", "vs/base/common/arrays", "vs/base/common/decorators", "vs/platform/storage/common/storage", "vs/workbench/common/editor", "vs/workbench/common/theme", "vs/editor/browser/widget/codeEditorWidget", "vs/workbench/contrib/codeEditor/browser/simpleEditorOptions", "vs/editor/common/services/modelService", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/editor/contrib/contextmenu/contextmenu", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/theme/common/colorRegistry", "vs/editor/contrib/suggest/suggestController", "vs/editor/contrib/snippet/snippetController2", "vs/base/common/network", "vs/platform/instantiation/common/serviceCollection", "vs/editor/contrib/hover/hover", "vs/editor/contrib/colorPicker/colorDetector", "vs/editor/contrib/links/links", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/editor/common/services/modeService", "vs/platform/label/common/label", "vs/workbench/browser/style", "vs/base/common/codicons", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/platform/theme/common/theme", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/browser/parts/editor/editorCommands", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/workspace/common/workspace", "vs/css!./media/scm"], function (require, exports, event_1, resources_1, lifecycle_1, viewPane_1, dom_1, scm_1, labels_1, countBadge_1, editorService_1, instantiation_1, contextView_1, contextkey_1, commands_1, keybinding_1, actions_1, actions_2, actionbar_1, themeService_1, util_1, styler_1, listService_1, configuration_1, async_1, resourceTree_1, iterator_1, uri_1, files_1, comparers_1, filters_1, views_1, nls_1, arrays_1, decorators_1, storage_1, editor_1, theme_1, codeEditorWidget_1, simpleEditorOptions_1, modelService_1, editorExtensions_1, menuPreventer_1, selectionClipboard_1, contextmenu_1, platform, strings_1, colorRegistry_1, suggestController_1, snippetController2_1, network_1, serviceCollection_1, hover_1, colorDetector_1, links_1, opener_1, telemetry_1, modeService_1, label_1, style_1, codicons_1, scmRepositoryRenderer_1, theme_2, uriIdentity_1, editorCommands_1, menuEntryActionViewItem_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.scmProviderSeparatorBorderColor = exports.SCMViewPane = exports.SCMAccessibilityProvider = exports.SCMTreeKeyboardNavigationLabelProvider = exports.SCMTreeSorter = void 0;
    let InputRenderer = class InputRenderer {
        constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
            this.outerLayout = outerLayout;
            this.overflowWidgetsDomNode = overflowWidgetsDomNode;
            this.updateHeight = updateHeight;
            this.instantiationService = instantiationService;
            this.inputWidgets = new Map();
            this.contentHeights = new WeakMap();
            this.editorSelections = new WeakMap();
        }
        get templateId() { return InputRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            const disposables = new lifecycle_1.DisposableStore();
            const inputElement = (0, dom_1.append)(container, (0, dom_1.$)('.scm-input'));
            const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
            disposables.add(inputWidget);
            return { inputWidget, disposable: lifecycle_1.Disposable.None, templateDisposable: disposables };
        }
        renderElement(node, index, templateData) {
            templateData.disposable.dispose();
            const disposables = new lifecycle_1.DisposableStore();
            const input = node.element;
            templateData.inputWidget.input = input;
            // Remember widget
            this.inputWidgets.set(input, templateData.inputWidget);
            disposables.add({ dispose: () => this.inputWidgets.delete(input) });
            // Widget cursor selections
            const selections = this.editorSelections.get(input);
            if (selections) {
                templateData.inputWidget.selections = selections;
            }
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                const selections = templateData.inputWidget.selections;
                if (selections) {
                    this.editorSelections.set(input, selections);
                }
            }));
            // Rerender the element whenever the editor content height changes
            const onDidChangeContentHeight = () => {
                const contentHeight = templateData.inputWidget.getContentHeight();
                const lastContentHeight = this.contentHeights.get(input);
                this.contentHeights.set(input, contentHeight);
                if (lastContentHeight !== contentHeight) {
                    this.updateHeight(input, contentHeight + 10);
                    templateData.inputWidget.layout();
                }
            };
            const startListeningContentHeightChange = () => {
                disposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
                onDidChangeContentHeight();
            };
            // Setup height change listener on next tick
            const timeout = (0, async_1.disposableTimeout)(startListeningContentHeightChange, 0);
            disposables.add(timeout);
            // Layout the editor whenever the outer layout happens
            const layoutEditor = () => templateData.inputWidget.layout();
            disposables.add(this.outerLayout.onDidChange(layoutEditor));
            layoutEditor();
            templateData.disposable = disposables;
        }
        renderCompressedElements() {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.disposable.dispose();
        }
        disposeTemplate(templateData) {
            templateData.disposable.dispose();
            templateData.templateDisposable.dispose();
        }
        getHeight(input) {
            var _a;
            return ((_a = this.contentHeights.get(input)) !== null && _a !== void 0 ? _a : InputRenderer.DEFAULT_HEIGHT) + 10;
        }
        getRenderedInputWidget(input) {
            return this.inputWidgets.get(input);
        }
        getFocusedInput() {
            for (const [input, inputWidget] of this.inputWidgets) {
                if (inputWidget.hasFocus()) {
                    return input;
                }
            }
            return undefined;
        }
        clearValidation() {
            for (const [, inputWidget] of this.inputWidgets) {
                inputWidget.clearValidation();
            }
        }
    };
    InputRenderer.DEFAULT_HEIGHT = 26;
    InputRenderer.TEMPLATE_ID = 'input';
    InputRenderer = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], InputRenderer);
    let ResourceGroupRenderer = class ResourceGroupRenderer {
        constructor(actionViewItemProvider, scmViewService, themeService) {
            this.actionViewItemProvider = actionViewItemProvider;
            this.scmViewService = scmViewService;
            this.themeService = themeService;
        }
        get templateId() { return ResourceGroupRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            // hack
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource-group'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const actionsContainer = (0, dom_1.append)(element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider });
            const countContainer = (0, dom_1.append)(element, (0, dom_1.$)('.count'));
            const count = new countBadge_1.CountBadge(countContainer);
            const styler = (0, styler_1.attachBadgeStyler)(count, this.themeService);
            const elementDisposables = lifecycle_1.Disposable.None;
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar, styler);
            return { name, count, actionBar, elementDisposables, disposables };
        }
        renderElement(node, index, template) {
            template.elementDisposables.dispose();
            const group = node.element;
            template.name.textContent = group.label;
            template.actionBar.clear();
            template.actionBar.context = group;
            template.count.setCount(group.elements.length);
            const disposables = new lifecycle_1.DisposableStore();
            const menus = this.scmViewService.menus.getRepositoryMenus(group.provider);
            disposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceGroupMenu(group), template.actionBar));
            template.elementDisposables = disposables;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible');
        }
        disposeElement(group, index, template) {
            template.elementDisposables.dispose();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
    };
    ResourceGroupRenderer.TEMPLATE_ID = 'resource group';
    ResourceGroupRenderer = __decorate([
        __param(1, scm_1.ISCMViewService),
        __param(2, themeService_1.IThemeService)
    ], ResourceGroupRenderer);
    class RepositoryPaneActionRunner extends actions_2.ActionRunner {
        constructor(getSelectedResources) {
            super();
            this.getSelectedResources = getSelectedResources;
        }
        async runAction(action, context) {
            if (!(action instanceof actions_1.MenuItemAction)) {
                return super.runAction(action, context);
            }
            const selection = this.getSelectedResources();
            const contextIsSelected = selection.some(s => s === context);
            const actualContext = contextIsSelected ? selection : [context];
            const args = (0, arrays_1.flatten)(actualContext.map(e => resourceTree_1.ResourceTree.isResourceNode(e) ? resourceTree_1.ResourceTree.collect(e) : [e]));
            await action.run(...args);
        }
    }
    let ResourceRenderer = class ResourceRenderer {
        constructor(viewModelProvider, labels, actionViewItemProvider, actionRunner, scmViewService, themeService) {
            this.viewModelProvider = viewModelProvider;
            this.labels = labels;
            this.actionViewItemProvider = actionViewItemProvider;
            this.actionRunner = actionRunner;
            this.scmViewService = scmViewService;
            this.themeService = themeService;
        }
        get templateId() { return ResourceRenderer.TEMPLATE_ID; }
        renderTemplate(container) {
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.resource'));
            const name = (0, dom_1.append)(element, (0, dom_1.$)('.name'));
            const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
            const actionsContainer = (0, dom_1.append)(fileLabel.element, (0, dom_1.$)('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: this.actionViewItemProvider,
                actionRunner: this.actionRunner
            });
            const decorationIcon = (0, dom_1.append)(element, (0, dom_1.$)('.decoration-icon'));
            const disposables = (0, lifecycle_1.combinedDisposable)(actionBar, fileLabel);
            return { element, name, fileLabel, decorationIcon, actionBar, elementDisposables: lifecycle_1.Disposable.None, disposables };
        }
        renderElement(node, index, template) {
            template.elementDisposables.dispose();
            const elementDisposables = new lifecycle_1.DisposableStore();
            const resourceOrFolder = node.element;
            const iconResource = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
            const uri = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
            const fileKind = resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) ? files_1.FileKind.FOLDER : files_1.FileKind.FILE;
            const viewModel = this.viewModelProvider();
            const tooltip = !resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
            template.actionBar.clear();
            template.actionBar.context = resourceOrFolder;
            let matches;
            let descriptionMatches;
            if (resourceTree_1.ResourceTree.isResourceNode(resourceOrFolder)) {
                if (resourceOrFolder.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                    elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceMenu(resourceOrFolder.element), template.actionBar));
                    template.name.classList.toggle('strike-through', resourceOrFolder.element.decorations.strikeThrough);
                    template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                }
                else {
                    matches = (0, filters_1.createMatches)(node.filterData);
                    const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                    elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceFolderMenu(resourceOrFolder.context), template.actionBar));
                    template.name.classList.remove('strike-through');
                    template.element.classList.remove('faded');
                }
            }
            else {
                [matches, descriptionMatches] = this._processFilterData(uri, node.filterData);
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
                elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceMenu(resourceOrFolder), template.actionBar));
                template.name.classList.toggle('strike-through', resourceOrFolder.decorations.strikeThrough);
                template.element.classList.toggle('faded', resourceOrFolder.decorations.faded);
            }
            const render = () => {
                const theme = this.themeService.getColorTheme();
                const icon = iconResource && (theme.type === theme_2.ColorScheme.LIGHT ? iconResource.decorations.icon : iconResource.decorations.iconDark);
                template.fileLabel.setFile(uri, {
                    fileDecorations: { colors: false, badges: !icon },
                    hidePath: viewModel.mode === "tree" /* Tree */,
                    fileKind,
                    matches,
                    descriptionMatches
                });
                if (icon) {
                    template.decorationIcon.style.display = '';
                    template.decorationIcon.style.backgroundImage = (0, dom_1.asCSSUrl)(icon);
                    template.decorationIcon.title = tooltip;
                }
                else {
                    template.decorationIcon.style.display = 'none';
                    template.decorationIcon.style.backgroundImage = '';
                    template.decorationIcon.title = '';
                }
            };
            elementDisposables.add(this.themeService.onDidColorThemeChange(render));
            render();
            template.element.setAttribute('data-tooltip', tooltip);
            template.elementDisposables = elementDisposables;
        }
        disposeElement(resource, index, template) {
            template.elementDisposables.dispose();
        }
        renderCompressedElements(node, index, template, height) {
            template.elementDisposables.dispose();
            const elementDisposables = new lifecycle_1.DisposableStore();
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name).join('/');
            const fileKind = files_1.FileKind.FOLDER;
            const matches = (0, filters_1.createMatches)(node.filterData);
            template.fileLabel.setResource({ resource: folder.uri, name: label }, {
                fileDecorations: { colors: false, badges: true },
                fileKind,
                matches
            });
            template.actionBar.clear();
            template.actionBar.context = folder;
            const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
            elementDisposables.add((0, util_1.connectPrimaryMenuToInlineActionBar)(menus.getResourceFolderMenu(folder.context), template.actionBar));
            template.name.classList.remove('strike-through');
            template.element.classList.remove('faded');
            template.decorationIcon.style.display = 'none';
            template.decorationIcon.style.backgroundImage = '';
            template.element.setAttribute('data-tooltip', '');
            template.elementDisposables = elementDisposables;
        }
        disposeCompressedElements(node, index, template, height) {
            template.elementDisposables.dispose();
        }
        disposeTemplate(template) {
            template.elementDisposables.dispose();
            template.disposables.dispose();
        }
        _processFilterData(uri, filterData) {
            if (!filterData) {
                return [undefined, undefined];
            }
            if (!filterData.label) {
                const matches = (0, filters_1.createMatches)(filterData);
                return [matches, undefined];
            }
            const fileName = (0, resources_1.basename)(uri);
            const label = filterData.label;
            const pathLength = label.length - fileName.length;
            const matches = (0, filters_1.createMatches)(filterData.score);
            // FileName match
            if (label === fileName) {
                return [matches, undefined];
            }
            // FilePath match
            let labelMatches = [];
            let descriptionMatches = [];
            for (const match of matches) {
                if (match.start > pathLength) {
                    // Label match
                    labelMatches.push({
                        start: match.start - pathLength,
                        end: match.end - pathLength
                    });
                }
                else if (match.end < pathLength) {
                    // Description match
                    descriptionMatches.push(match);
                }
                else {
                    // Spanning match
                    labelMatches.push({
                        start: 0,
                        end: match.end - pathLength
                    });
                    descriptionMatches.push({
                        start: match.start,
                        end: pathLength
                    });
                }
            }
            return [labelMatches, descriptionMatches];
        }
    };
    ResourceRenderer.TEMPLATE_ID = 'resource';
    ResourceRenderer = __decorate([
        __param(4, scm_1.ISCMViewService),
        __param(5, themeService_1.IThemeService)
    ], ResourceRenderer);
    class ListDelegate {
        constructor(inputRenderer) {
            this.inputRenderer = inputRenderer;
        }
        getHeight(element) {
            if ((0, util_1.isSCMInput)(element)) {
                return this.inputRenderer.getHeight(element);
            }
            else {
                return 22;
            }
        }
        getTemplateId(element) {
            if ((0, util_1.isSCMRepository)(element)) {
                return scmRepositoryRenderer_1.RepositoryRenderer.TEMPLATE_ID;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return InputRenderer.TEMPLATE_ID;
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(element) || (0, util_1.isSCMResource)(element)) {
                return ResourceRenderer.TEMPLATE_ID;
            }
            else {
                return ResourceGroupRenderer.TEMPLATE_ID;
            }
        }
    }
    class SCMTreeFilter {
        filter(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return true;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.elements.length > 0 || !element.hideWhenEmpty;
            }
            else {
                return true;
            }
        }
    }
    class SCMTreeSorter {
        constructor(viewModelProvider) {
            this.viewModelProvider = viewModelProvider;
        }
        get viewModel() { return this.viewModelProvider(); }
        compare(one, other) {
            var _a, _b;
            if ((0, util_1.isSCMRepository)(one)) {
                if (!(0, util_1.isSCMRepository)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            if ((0, util_1.isSCMInput)(one)) {
                return -1;
            }
            else if ((0, util_1.isSCMInput)(other)) {
                return 1;
            }
            if ((0, util_1.isSCMResourceGroup)(one)) {
                if (!(0, util_1.isSCMResourceGroup)(other)) {
                    throw new Error('Invalid comparison');
                }
                return 0;
            }
            // List
            if (this.viewModel.mode === "list" /* List */) {
                // FileName
                if (this.viewModel.sortKey === "name" /* Name */) {
                    const oneName = (0, resources_1.basename)(one.sourceUri);
                    const otherName = (0, resources_1.basename)(other.sourceUri);
                    return (0, comparers_1.compareFileNames)(oneName, otherName);
                }
                // Status
                if (this.viewModel.sortKey === "status" /* Status */) {
                    const oneTooltip = (_a = one.decorations.tooltip) !== null && _a !== void 0 ? _a : '';
                    const otherTooltip = (_b = other.decorations.tooltip) !== null && _b !== void 0 ? _b : '';
                    if (oneTooltip !== otherTooltip) {
                        return (0, strings_1.compare)(oneTooltip, otherTooltip);
                    }
                }
                // Path (default)
                const onePath = one.sourceUri.fsPath;
                const otherPath = other.sourceUri.fsPath;
                return (0, comparers_1.comparePaths)(onePath, otherPath);
            }
            // Tree
            const oneIsDirectory = resourceTree_1.ResourceTree.isResourceNode(one);
            const otherIsDirectory = resourceTree_1.ResourceTree.isResourceNode(other);
            if (oneIsDirectory !== otherIsDirectory) {
                return oneIsDirectory ? -1 : 1;
            }
            const oneName = resourceTree_1.ResourceTree.isResourceNode(one) ? one.name : (0, resources_1.basename)(one.sourceUri);
            const otherName = resourceTree_1.ResourceTree.isResourceNode(other) ? other.name : (0, resources_1.basename)(other.sourceUri);
            return (0, comparers_1.compareFileNames)(oneName, otherName);
        }
    }
    __decorate([
        decorators_1.memoize
    ], SCMTreeSorter.prototype, "viewModel", null);
    exports.SCMTreeSorter = SCMTreeSorter;
    let SCMTreeKeyboardNavigationLabelProvider = class SCMTreeKeyboardNavigationLabelProvider {
        constructor(viewModelProvider, labelService) {
            this.viewModelProvider = viewModelProvider;
            this.labelService = labelService;
        }
        getKeyboardNavigationLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return element.name;
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                return undefined;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return undefined;
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else {
                const viewModel = this.viewModelProvider();
                if (viewModel.mode === "list" /* List */) {
                    // In List mode match using the file name and the path.
                    // Since we want to match both on the file name and the
                    // full path we return an array of labels. A match in the
                    // file name takes precedence over a match in the path.
                    const fileName = (0, resources_1.basename)(element.sourceUri);
                    const filePath = this.labelService.getUriLabel(element.sourceUri, { relative: true });
                    return [fileName, filePath];
                }
                else {
                    // In Tree mode only match using the file name
                    return (0, resources_1.basename)(element.sourceUri);
                }
            }
        }
        getCompressedNodeKeyboardNavigationLabel(elements) {
            const folders = elements;
            return folders.map(e => e.name).join('/');
        }
    };
    SCMTreeKeyboardNavigationLabelProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SCMTreeKeyboardNavigationLabelProvider);
    exports.SCMTreeKeyboardNavigationLabelProvider = SCMTreeKeyboardNavigationLabelProvider;
    function getSCMResourceId(element) {
        if (resourceTree_1.ResourceTree.isResourceNode(element)) {
            const group = element.context;
            return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
        }
        else if ((0, util_1.isSCMRepository)(element)) {
            const provider = element.provider;
            return `repo:${provider.id}`;
        }
        else if ((0, util_1.isSCMInput)(element)) {
            const provider = element.repository.provider;
            return `input:${provider.id}`;
        }
        else if ((0, util_1.isSCMResource)(element)) {
            const group = element.resourceGroup;
            const provider = group.provider;
            return `resource:${provider.id}/${group.id}/${element.sourceUri.toString()}`;
        }
        else {
            const provider = element.provider;
            return `group:${provider.id}/${element.id}`;
        }
    }
    class SCMResourceIdentityProvider {
        getId(element) {
            return getSCMResourceId(element);
        }
    }
    let SCMAccessibilityProvider = class SCMAccessibilityProvider {
        constructor(labelService, workspaceContextService) {
            this.labelService = labelService;
            this.workspaceContextService = workspaceContextService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
            }
            else if ((0, util_1.isSCMRepository)(element)) {
                let folderName = '';
                if (element.provider.rootUri) {
                    const folder = this.workspaceContextService.getWorkspaceFolder(element.provider.rootUri);
                    if ((folder === null || folder === void 0 ? void 0 : folder.uri.toString()) === element.provider.rootUri.toString()) {
                        folderName = folder.name;
                    }
                    else {
                        folderName = (0, resources_1.basename)(element.provider.rootUri);
                    }
                }
                return `${folderName} ${element.provider.label}`;
            }
            else if ((0, util_1.isSCMInput)(element)) {
                return (0, nls_1.localize)(1, null);
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                return element.label;
            }
            else {
                const result = [];
                result.push((0, resources_1.basename)(element.sourceUri));
                if (element.decorations.tooltip) {
                    result.push(element.decorations.tooltip);
                }
                const path = this.labelService.getUriLabel((0, resources_1.dirname)(element.sourceUri), { relative: true, noPrefix: true });
                if (path) {
                    result.push(path);
                }
                return result.join(', ');
            }
        }
    };
    SCMAccessibilityProvider = __decorate([
        __param(0, label_1.ILabelService),
        __param(1, workspace_1.IWorkspaceContextService)
    ], SCMAccessibilityProvider);
    exports.SCMAccessibilityProvider = SCMAccessibilityProvider;
    function isRepositoryItem(item) {
        return Array.isArray(item.groupItems);
    }
    function asTreeElement(node, forceIncompressible, viewState) {
        const element = (node.childrenCount === 0 && node.element) ? node.element : node;
        const collapsed = viewState ? viewState.collapsed.indexOf(getSCMResourceId(element)) > -1 : false;
        return {
            element,
            children: iterator_1.Iterable.map(node.children, node => asTreeElement(node, false, viewState)),
            incompressible: !!node.element || forceIncompressible,
            collapsed,
            collapsible: node.childrenCount > 0
        };
    }
    var ViewModelMode;
    (function (ViewModelMode) {
        ViewModelMode["List"] = "list";
        ViewModelMode["Tree"] = "tree";
    })(ViewModelMode || (ViewModelMode = {}));
    var ViewModelSortKey;
    (function (ViewModelSortKey) {
        ViewModelSortKey["Path"] = "path";
        ViewModelSortKey["Name"] = "name";
        ViewModelSortKey["Status"] = "status";
    })(ViewModelSortKey || (ViewModelSortKey = {}));
    const Menus = {
        ViewSort: new actions_1.MenuId('SCMViewSort'),
        Repositories: new actions_1.MenuId('SCMRepositories'),
    };
    const ContextKeys = {
        ViewModelMode: new contextkey_1.RawContextKey('scmViewModelMode', "list" /* List */),
        ViewModelSortKey: new contextkey_1.RawContextKey('scmViewModelSortKey', "path" /* Path */),
        ViewModelAreAllRepositoriesCollapsed: new contextkey_1.RawContextKey('scmViewModelAreAllRepositoriesCollapsed', false),
        ViewModelIsAnyRepositoryCollapsible: new contextkey_1.RawContextKey('scmViewModelIsAnyRepositoryCollapsible', false),
        SCMProvider: new contextkey_1.RawContextKey('scmProvider', undefined),
        SCMProviderRootUri: new contextkey_1.RawContextKey('scmProviderRootUri', undefined),
        SCMProviderHasRootUri: new contextkey_1.RawContextKey('scmProviderHasRootUri', undefined),
        RepositoryCount: new contextkey_1.RawContextKey('scmRepositoryCount', 0),
        RepositoryVisibilityCount: new contextkey_1.RawContextKey('scmRepositoryVisibleCount', 0),
        RepositoryVisibility(repository) {
            return new contextkey_1.RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
        }
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMTitle, {
        title: (0, nls_1.localize)(2, null),
        submenu: Menus.ViewSort,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
        group: '0_view&sort'
    });
    actions_1.MenuRegistry.appendMenuItem(Menus.ViewSort, {
        title: (0, nls_1.localize)(3, null),
        submenu: Menus.Repositories,
        group: '0_repositories'
    });
    class RepositoryVisibilityAction extends actions_1.Action2 {
        constructor(repository) {
            const title = repository.provider.rootUri ? (0, resources_1.basename)(repository.provider.rootUri) : repository.provider.label;
            super({
                id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
                title,
                f1: false,
                precondition: contextkey_1.ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
                toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
                menu: { id: Menus.Repositories }
            });
            this.repository = repository;
        }
        run(accessor) {
            const scmViewService = accessor.get(scm_1.ISCMViewService);
            scmViewService.toggleVisibility(this.repository);
        }
    }
    let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
        constructor(scmViewService, scmService, contextKeyService) {
            this.scmViewService = scmViewService;
            this.contextKeyService = contextKeyService;
            this.items = new Map();
            this.disposables = new lifecycle_1.DisposableStore();
            this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
            this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
            scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            for (const repository of scmService.repositories) {
                this.onDidAddRepository(repository);
            }
        }
        onDidAddRepository(repository) {
            const action = (0, actions_1.registerAction2)(class extends RepositoryVisibilityAction {
                constructor() {
                    super(repository);
                }
            });
            const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
            contextKey.set(this.scmViewService.isVisible(repository));
            this.items.set(repository, {
                contextKey,
                dispose() {
                    contextKey.reset();
                    action.dispose();
                }
            });
            this.updateRepositoriesCounts();
        }
        onDidRemoveRepository(repository) {
            var _a;
            (_a = this.items.get(repository)) === null || _a === void 0 ? void 0 : _a.dispose();
            this.items.delete(repository);
            this.updateRepositoriesCounts();
        }
        onDidChangeVisibleRepositories() {
            let count = 0;
            for (const [repository, item] of this.items) {
                const isVisible = this.scmViewService.isVisible(repository);
                item.contextKey.set(isVisible);
                if (isVisible) {
                    count++;
                }
            }
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(count);
        }
        updateRepositoriesCounts() {
            this.repositoryCountContextKey.set(this.items.size);
            this.repositoryVisibilityCountContextKey.set(iterator_1.Iterable.reduce(this.items.keys(), (r, repository) => r + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
        }
        dispose() {
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.items.values());
            this.items.clear();
        }
    };
    RepositoryVisibilityActionController = __decorate([
        __param(0, scm_1.ISCMViewService),
        __param(1, scm_1.ISCMService),
        __param(2, contextkey_1.IContextKeyService)
    ], RepositoryVisibilityActionController);
    let ViewModel = class ViewModel {
        constructor(tree, inputRenderer, _mode, _treeViewState, instantiationService, editorService, configurationService, scmViewService, uriIdentityService, contextKeyService) {
            this.tree = tree;
            this.inputRenderer = inputRenderer;
            this._mode = _mode;
            this._treeViewState = _treeViewState;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.scmViewService = scmViewService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeMode = new event_1.Emitter();
            this.onDidChangeMode = this._onDidChangeMode.event;
            this.visible = false;
            this._sortKey = "path" /* Path */;
            this._treeViewStateIsStale = false;
            this.items = new Map();
            this.visibilityDisposables = new lifecycle_1.DisposableStore();
            this.alwaysShowRepositories = false;
            this.firstVisible = true;
            this.disposables = new lifecycle_1.DisposableStore();
            this.modeContextKey = ContextKeys.ViewModelMode.bindTo(contextKeyService);
            this.modeContextKey.set(_mode);
            this.sortKeyContextKey = ContextKeys.ViewModelSortKey.bindTo(contextKeyService);
            this.sortKeyContextKey.set(this._sortKey);
            this.areAllRepositoriesCollapsedContextKey = ContextKeys.ViewModelAreAllRepositoriesCollapsed.bindTo(contextKeyService);
            this.isAnyRepositoryCollapsibleContextKey = ContextKeys.ViewModelIsAnyRepositoryCollapsible.bindTo(contextKeyService);
            this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
            this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
            this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
            configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
            this.onDidChangeConfiguration();
            event_1.Event.filter(this.tree.onDidChangeCollapseState, e => (0, util_1.isSCMRepository)(e.node.element))(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
            this.disposables.add(this.tree.onDidChangeCollapseState(() => this._treeViewStateIsStale = true));
        }
        get mode() { return this._mode; }
        set mode(mode) {
            if (this._mode === mode) {
                return;
            }
            this._mode = mode;
            for (const [, item] of this.items) {
                for (const groupItem of item.groupItems) {
                    groupItem.tree.clear();
                    if (mode === "tree" /* Tree */) {
                        for (const resource of groupItem.resources) {
                            groupItem.tree.add(resource.sourceUri, resource);
                        }
                    }
                }
            }
            this.refresh();
            this._onDidChangeMode.fire(mode);
            this.modeContextKey.set(mode);
        }
        get sortKey() { return this._sortKey; }
        set sortKey(sortKey) {
            if (sortKey !== this._sortKey) {
                this._sortKey = sortKey;
                this.refresh();
            }
            this.sortKeyContextKey.set(sortKey);
        }
        get treeViewState() {
            if (this.visible && this._treeViewStateIsStale) {
                this.updateViewState();
                this._treeViewStateIsStale = false;
            }
            return this._treeViewState;
        }
        onDidChangeConfiguration(e) {
            if (!e || e.affectsConfiguration('scm.alwaysShowRepositories')) {
                this.alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
                this.refresh();
            }
        }
        _onDidChangeVisibleRepositories({ added, removed }) {
            for (const repository of added) {
                const disposable = (0, lifecycle_1.combinedDisposable)(repository.provider.groups.onDidSplice(splice => this._onDidSpliceGroups(item, splice)), repository.input.onDidChangeVisibility(() => this.refresh(item)));
                const groupItems = repository.provider.groups.elements.map(group => this.createGroupItem(group));
                const item = {
                    element: repository, groupItems, dispose() {
                        (0, lifecycle_1.dispose)(this.groupItems);
                        disposable.dispose();
                    }
                };
                this.items.set(repository, item);
            }
            for (const repository of removed) {
                const item = this.items.get(repository);
                item.dispose();
                this.items.delete(repository);
            }
            this.refresh();
        }
        _onDidSpliceGroups(item, { start, deleteCount, toInsert }) {
            const itemsToInsert = toInsert.map(group => this.createGroupItem(group));
            const itemsToDispose = item.groupItems.splice(start, deleteCount, ...itemsToInsert);
            for (const item of itemsToDispose) {
                item.dispose();
            }
            this.refresh();
        }
        createGroupItem(group) {
            const tree = new resourceTree_1.ResourceTree(group, group.provider.rootUri || uri_1.URI.file('/'), this.uriIdentityService.extUri);
            const resources = [...group.elements];
            const disposable = (0, lifecycle_1.combinedDisposable)(group.onDidChange(() => this.tree.refilter()), group.onDidSplice(splice => this._onDidSpliceGroup(item, splice)));
            const item = { element: group, resources, tree, dispose() { disposable.dispose(); } };
            if (this._mode === "tree" /* Tree */) {
                for (const resource of resources) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            return item;
        }
        _onDidSpliceGroup(item, { start, deleteCount, toInsert }) {
            const before = item.resources.length;
            const deleted = item.resources.splice(start, deleteCount, ...toInsert);
            const after = item.resources.length;
            if (this._mode === "tree" /* Tree */) {
                for (const resource of deleted) {
                    item.tree.delete(resource.sourceUri);
                }
                for (const resource of toInsert) {
                    item.tree.add(resource.sourceUri, resource);
                }
            }
            if (before !== after && (before === 0 || after === 0)) {
                this.refresh();
            }
            else {
                this.refresh(item);
            }
        }
        setVisible(visible) {
            if (visible) {
                this.visibilityDisposables = new lifecycle_1.DisposableStore();
                this.scmViewService.onDidChangeVisibleRepositories(this._onDidChangeVisibleRepositories, this, this.visibilityDisposables);
                this._onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: iterator_1.Iterable.empty() });
                if (typeof this.scrollTop === 'number') {
                    this.tree.scrollTop = this.scrollTop;
                    this.scrollTop = undefined;
                }
                this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
                this.onDidActiveEditorChange();
            }
            else {
                this.updateViewState();
                this.visibilityDisposables.dispose();
                this._onDidChangeVisibleRepositories({ added: iterator_1.Iterable.empty(), removed: [...this.items.keys()] });
                this.scrollTop = this.tree.scrollTop;
            }
            this.visible = visible;
            this.updateRepositoryCollapseAllContextKeys();
        }
        refresh(item) {
            var _a;
            if (!this.alwaysShowRepositories && this.items.size === 1) {
                const provider = iterator_1.Iterable.first(this.items.values()).element.provider;
                this.scmProviderContextKey.set(provider.contextValue);
                this.scmProviderRootUriContextKey.set((_a = provider.rootUri) === null || _a === void 0 ? void 0 : _a.toString());
                this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
            }
            else {
                this.scmProviderContextKey.set(undefined);
                this.scmProviderRootUriContextKey.set(undefined);
                this.scmProviderHasRootUriContextKey.set(false);
            }
            if (!this.alwaysShowRepositories && (this.items.size === 1 && (!item || isRepositoryItem(item)))) {
                const item = iterator_1.Iterable.first(this.items.values());
                this.tree.setChildren(null, this.render(item, this.treeViewState).children);
            }
            else if (item) {
                this.tree.setChildren(item.element, this.render(item, this.treeViewState).children);
            }
            else {
                const items = (0, arrays_1.coalesce)(this.scmViewService.visibleRepositories.map(r => this.items.get(r)));
                this.tree.setChildren(null, items.map(item => this.render(item, this.treeViewState)));
            }
            this.updateRepositoryCollapseAllContextKeys();
        }
        render(item, treeViewState) {
            if (isRepositoryItem(item)) {
                const children = [];
                const hasSomeChanges = item.groupItems.some(item => item.element.elements.length > 0);
                if (item.element.input.visible) {
                    children.push({ element: item.element.input, incompressible: true, collapsible: false });
                }
                if (this.items.size === 1 || hasSomeChanges) {
                    children.push(...item.groupItems.map(i => this.render(i, treeViewState)));
                }
                const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
                return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
            }
            else {
                const children = this.mode === "list" /* List */
                    ? iterator_1.Iterable.map(item.resources, element => ({ element, incompressible: true }))
                    : iterator_1.Iterable.map(item.tree.root.children, node => asTreeElement(node, true, treeViewState));
                const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
                return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
            }
        }
        updateViewState() {
            const collapsed = [];
            const visit = (node) => {
                if (node.element && node.collapsible && node.collapsed) {
                    collapsed.push(getSCMResourceId(node.element));
                }
                for (const child of node.children) {
                    visit(child);
                }
            };
            visit(this.tree.getNode());
            this._treeViewState = { collapsed };
        }
        onDidActiveEditorChange() {
            var _a;
            if (!this.configurationService.getValue('scm.autoReveal')) {
                return;
            }
            if (this.firstVisible) {
                this.firstVisible = false;
                this.visibilityDisposables.add((0, async_1.disposableTimeout)(() => this.onDidActiveEditorChange(), 250));
                return;
            }
            const uri = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (!uri) {
                return;
            }
            for (const repository of this.scmViewService.visibleRepositories) {
                const item = this.items.get(repository);
                if (!item) {
                    continue;
                }
                // go backwards from last group
                for (let j = item.groupItems.length - 1; j >= 0; j--) {
                    const groupItem = item.groupItems[j];
                    const resource = this.mode === "tree" /* Tree */
                        ? (_a = groupItem.tree.getNode(uri)) === null || _a === void 0 ? void 0 : _a.element
                        : groupItem.resources.find(r => this.uriIdentityService.extUri.isEqual(r.sourceUri, uri));
                    if (resource) {
                        this.tree.reveal(resource);
                        this.tree.setSelection([resource]);
                        this.tree.setFocus([resource]);
                        return;
                    }
                }
            }
        }
        focus() {
            if (this.tree.getFocus().length === 0) {
                for (const repository of this.scmViewService.visibleRepositories) {
                    const widget = this.inputRenderer.getRenderedInputWidget(repository.input);
                    if (widget) {
                        widget.focus();
                        return;
                    }
                }
            }
            this.tree.domFocus();
        }
        updateRepositoryCollapseAllContextKeys() {
            if (!this.visible || this.scmViewService.visibleRepositories.length === 1) {
                this.isAnyRepositoryCollapsibleContextKey.set(false);
                this.areAllRepositoriesCollapsedContextKey.set(false);
                return;
            }
            this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some(r => this.tree.hasElement(r) && this.tree.isCollapsible(r)));
            this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every(r => this.tree.hasElement(r) && (!this.tree.isCollapsible(r) || this.tree.isCollapsed(r))));
        }
        collapseAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.collapse(repository);
                }
            }
        }
        expandAllRepositories() {
            for (const repository of this.scmViewService.visibleRepositories) {
                if (this.tree.isCollapsible(repository)) {
                    this.tree.expand(repository);
                }
            }
        }
        dispose() {
            this.visibilityDisposables.dispose();
            this.disposables.dispose();
            (0, lifecycle_1.dispose)(this.items.values());
            this.items.clear();
        }
    };
    ViewModel = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, editorService_1.IEditorService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, scm_1.ISCMViewService),
        __param(8, uriIdentity_1.IUriIdentityService),
        __param(9, contextkey_1.IContextKeyService)
    ], ViewModel);
    class SetListViewModeAction extends viewPane_1.ViewAction {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setListViewMode',
                title: (0, nls_1.localize)(4, null),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listFlat,
                toggled: ContextKeys.ViewModelMode.isEqualTo("list" /* List */),
                menu: Object.assign({ id: Menus.ViewSort, group: '1_viewmode' }, menu)
            });
        }
        async runInView(_, view) {
            view.viewModel.mode = "list" /* List */;
        }
    }
    class SetListViewModeNavigationAction extends SetListViewModeAction {
        constructor() {
            super({
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("tree" /* Tree */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    class SetTreeViewModeAction extends viewPane_1.ViewAction {
        constructor(menu = {}) {
            super({
                id: 'workbench.scm.action.setTreeViewMode',
                title: (0, nls_1.localize)(5, null),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.listTree,
                toggled: ContextKeys.ViewModelMode.isEqualTo("tree" /* Tree */),
                menu: Object.assign({ id: Menus.ViewSort, group: '1_viewmode' }, menu)
            });
        }
        async runInView(_, view) {
            view.viewModel.mode = "tree" /* Tree */;
        }
    }
    class SetTreeViewModeNavigationAction extends SetTreeViewModeAction {
        constructor() {
            super({
                id: actions_1.MenuId.SCMTitle,
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("list" /* List */)),
                group: 'navigation',
                order: -1000
            });
        }
    }
    (0, actions_1.registerAction2)(SetListViewModeAction);
    (0, actions_1.registerAction2)(SetTreeViewModeAction);
    (0, actions_1.registerAction2)(SetListViewModeNavigationAction);
    (0, actions_1.registerAction2)(SetTreeViewModeNavigationAction);
    class SetSortKeyAction extends viewPane_1.ViewAction {
        constructor(sortKey, title) {
            super({
                id: `workbench.scm.action.setSortKey.${sortKey}`,
                title: title,
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                toggled: ContextKeys.ViewModelSortKey.isEqualTo(sortKey),
                menu: { id: Menus.ViewSort, group: '2_sort' }
            });
            this.sortKey = sortKey;
        }
        async runInView(_, view) {
            view.viewModel.sortKey = this.sortKey;
        }
    }
    class SetSortByNameAction extends SetSortKeyAction {
        constructor() {
            super("name" /* Name */, (0, nls_1.localize)(6, null));
        }
    }
    class SetSortByPathAction extends SetSortKeyAction {
        constructor() {
            super("path" /* Path */, (0, nls_1.localize)(7, null));
        }
    }
    class SetSortByStatusAction extends SetSortKeyAction {
        constructor() {
            super("status" /* Status */, (0, nls_1.localize)(8, null));
        }
    }
    (0, actions_1.registerAction2)(SetSortByNameAction);
    (0, actions_1.registerAction2)(SetSortByPathAction);
    (0, actions_1.registerAction2)(SetSortByStatusAction);
    class CollapseAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.collapseAllRepositories`,
                title: (0, nls_1.localize)(9, null),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(false))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.collapseAllRepositories();
        }
    }
    class ExpandAllRepositoriesAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.scm.action.expandAllRepositories`,
                title: (0, nls_1.localize)(10, null),
                viewId: scm_1.VIEW_PANE_ID,
                f1: false,
                icon: codicons_1.Codicon.expandAll,
                menu: {
                    id: actions_1.MenuId.SCMTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', scm_1.VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(true))
                }
            });
        }
        async runInView(_, view) {
            view.viewModel.expandAllRepositories();
        }
    }
    (0, actions_1.registerAction2)(CollapseAllRepositoriesAction);
    (0, actions_1.registerAction2)(ExpandAllRepositoriesAction);
    let SCMInputWidget = class SCMInputWidget extends lifecycle_1.Disposable {
        constructor(container, overflowWidgetsDomNode, contextKeyService, modelService, modeService, keybindingService, configurationService, instantiationService, scmViewService, contextViewService) {
            super();
            this.modelService = modelService;
            this.modeService = modeService;
            this.keybindingService = keybindingService;
            this.configurationService = configurationService;
            this.scmViewService = scmViewService;
            this.contextViewService = contextViewService;
            this.defaultInputFontFamily = style_1.DEFAULT_FONT_FAMILY;
            this.repositoryDisposables = new lifecycle_1.DisposableStore();
            this.validationDisposable = lifecycle_1.Disposable.None;
            // This is due to "Setup height change listener on next tick" above
            // https://github.com/microsoft/vscode/issues/108067
            this.lastLayoutWasTrash = false;
            this.shouldFocusAfterLayout = false;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor'));
            this.editorContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('.scm-editor-container'));
            this.placeholderTextContainer = (0, dom_1.append)(this.editorContainer, (0, dom_1.$)('.scm-editor-placeholder'));
            const fontFamily = this.getInputEditorFontFamily();
            const fontSize = this.getInputEditorFontSize();
            const lineHeight = this.computeLineHeight(fontSize);
            this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
            const contextKeyService2 = contextKeyService.createScoped(this.element);
            this.repositoryContextKey = contextKeyService2.createKey('scmRepository', undefined);
            const editorOptions = Object.assign(Object.assign({}, (0, simpleEditorOptions_1.getSimpleEditorOptions)()), { lineDecorationsWidth: 4, dragAndDrop: false, cursorWidth: 1, fontSize: fontSize, lineHeight: lineHeight, fontFamily: fontFamily, wrappingStrategy: 'advanced', wrappingIndent: 'none', padding: { top: 3, bottom: 3 }, quickSuggestions: false, scrollbar: { alwaysConsumeMouseWheel: false }, overflowWidgetsDomNode, renderWhitespace: 'none' });
            const codeEditorWidgetOptions = {
                isSimpleWidget: true,
                contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                    suggestController_1.SuggestController.ID,
                    snippetController2_1.SnippetController2.ID,
                    menuPreventer_1.MenuPreventer.ID,
                    selectionClipboard_1.SelectionClipboardContributionID,
                    contextmenu_1.ContextMenuController.ID,
                    colorDetector_1.ColorDetector.ID,
                    hover_1.ModesHoverController.ID,
                    links_1.LinkDetector.ID
                ])
            };
            const services = new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyService2]);
            const instantiationService2 = instantiationService.createChild(services);
            this.inputEditor = instantiationService2.createInstance(codeEditorWidget_1.CodeEditorWidget, this.editorContainer, editorOptions, codeEditorWidgetOptions);
            this._register(this.inputEditor);
            this._register(this.inputEditor.onDidFocusEditorText(() => {
                var _a;
                if ((_a = this.input) === null || _a === void 0 ? void 0 : _a.repository) {
                    this.scmViewService.focus(this.input.repository);
                }
                this.editorContainer.classList.add('synthetic-focus');
                this.renderValidation();
            }));
            this._register(this.inputEditor.onDidBlurEditorText(() => {
                this.editorContainer.classList.remove('synthetic-focus');
                this.validationDisposable.dispose();
            }));
            const firstLineKey = contextKeyService2.createKey('scmInputIsInFirstPosition', false);
            const lastLineKey = contextKeyService2.createKey('scmInputIsInLastPosition', false);
            this._register(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
                const viewModel = this.inputEditor._getViewModel();
                const lastLineNumber = viewModel.getLineCount();
                const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
                const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
                firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
                lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
            }));
            const onInputFontFamilyChanged = event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.inputFontFamily') || e.affectsConfiguration('scm.inputFontSize'));
            this._register(onInputFontFamilyChanged(() => {
                const fontFamily = this.getInputEditorFontFamily();
                const fontSize = this.getInputEditorFontSize();
                const lineHeight = this.computeLineHeight(fontSize);
                this.inputEditor.updateOptions({
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                });
                this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
            }));
            this.onDidChangeContentHeight = event_1.Event.signal(event_1.Event.filter(this.inputEditor.onDidContentSizeChange, e => e.contentHeightChanged));
        }
        get input() {
            var _a;
            return (_a = this.model) === null || _a === void 0 ? void 0 : _a.input;
        }
        set input(input) {
            var _a, _b;
            if (input === this.input) {
                return;
            }
            this.validationDisposable.dispose();
            this.editorContainer.classList.remove('synthetic-focus');
            this.repositoryDisposables.dispose();
            this.repositoryDisposables = new lifecycle_1.DisposableStore();
            this.repositoryContextKey.set(input === null || input === void 0 ? void 0 : input.repository);
            if (!input) {
                (_a = this.model) === null || _a === void 0 ? void 0 : _a.textModel.dispose();
                this.inputEditor.setModel(undefined);
                this.model = undefined;
                return;
            }
            let query;
            if (input.repository.provider.rootUri) {
                query = `rootUri=${encodeURIComponent(input.repository.provider.rootUri.toString())}`;
            }
            const uri = uri_1.URI.from({
                scheme: network_1.Schemas.vscode,
                path: `scm/${input.repository.provider.contextValue}/${input.repository.provider.id}/input`,
                query
            });
            if (this.configurationService.getValue('editor.wordBasedSuggestions', { resource: uri }) !== false) {
                this.configurationService.updateValue('editor.wordBasedSuggestions', false, { resource: uri }, 7 /* MEMORY */);
            }
            const textModel = (_b = this.modelService.getModel(uri)) !== null && _b !== void 0 ? _b : this.modelService.createModel('', this.modeService.create('scminput'), uri);
            this.inputEditor.setModel(textModel);
            // Validation
            const validationDelayer = new async_1.ThrottledDelayer(200);
            const validate = async () => {
                var _a;
                const position = (_a = this.inputEditor.getSelection()) === null || _a === void 0 ? void 0 : _a.getStartPosition();
                const offset = position && textModel.getOffsetAt(position);
                const value = textModel.getValue();
                this.setValidation(await input.validateInput(value, offset || 0));
            };
            const triggerValidation = () => validationDelayer.trigger(validate);
            this.repositoryDisposables.add(validationDelayer);
            this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
            // Adaptive indentation rules
            const opts = this.modelService.getCreationOptions(textModel.getLanguageIdentifier().language, textModel.uri, textModel.isForSimpleWidget);
            const onEnter = event_1.Event.filter(this.inputEditor.onKeyDown, e => e.keyCode === 3 /* Enter */);
            this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
            // Keep model in sync with API
            textModel.setValue(input.value);
            this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
                if (value === textModel.getValue()) { // circuit breaker
                    return;
                }
                textModel.setValue(value);
                const position = reason === scm_1.SCMInputChangeReason.HistoryPrevious
                    ? textModel.getFullModelRange().getStartPosition()
                    : textModel.getFullModelRange().getEndPosition();
                this.inputEditor.setPosition(position);
                this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
            }));
            this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
            this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
            // Keep API in sync with model, update placeholder visibility and validate
            const updatePlaceholderVisibility = () => this.placeholderTextContainer.classList.toggle('hidden', textModel.getValueLength() > 0);
            this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
                input.setValue(textModel.getValue(), true);
                updatePlaceholderVisibility();
                triggerValidation();
            }));
            updatePlaceholderVisibility();
            // Update placeholder text
            const updatePlaceholderText = () => {
                const binding = this.keybindingService.lookupKeybinding('scm.acceptInput');
                const label = binding ? binding.getLabel() : (platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
                const placeholderText = (0, strings_1.format)(input.placeholder, label);
                this.inputEditor.updateOptions({ ariaLabel: placeholderText });
                this.placeholderTextContainer.textContent = placeholderText;
            };
            this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
            this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
            updatePlaceholderText();
            // Update input template
            let commitTemplate = '';
            const updateTemplate = () => {
                if (typeof input.repository.provider.commitTemplate === 'undefined' || !input.visible) {
                    return;
                }
                const oldCommitTemplate = commitTemplate;
                commitTemplate = input.repository.provider.commitTemplate;
                const value = textModel.getValue();
                if (value && value !== oldCommitTemplate) {
                    return;
                }
                textModel.setValue(commitTemplate);
            };
            this.repositoryDisposables.add(input.repository.provider.onDidChangeCommitTemplate(updateTemplate, this));
            updateTemplate();
            // Save model
            this.model = { input, textModel };
        }
        get selections() {
            return this.inputEditor.getSelections();
        }
        set selections(selections) {
            if (selections) {
                this.inputEditor.setSelections(selections);
            }
        }
        setValidation(validation, options) {
            if (this._validationTimer) {
                clearTimeout(this._validationTimer);
                this._validationTimer = 0;
            }
            this.validation = validation;
            this.renderValidation();
            if ((options === null || options === void 0 ? void 0 : options.focus) && !this.hasFocus()) {
                this.focus();
            }
            if (validation && (options === null || options === void 0 ? void 0 : options.timeout)) {
                this._validationTimer = setTimeout(() => this.setValidation(undefined), SCMInputWidget.ValidationTimeouts[validation.type]);
            }
        }
        getContentHeight() {
            const editorContentHeight = this.inputEditor.getContentHeight();
            return Math.min(editorContentHeight, 134);
        }
        layout() {
            const editorHeight = this.getContentHeight();
            const dimension = new dom_1.Dimension(this.element.clientWidth - 2, editorHeight);
            if (dimension.width < 0) {
                this.lastLayoutWasTrash = true;
                return;
            }
            this.lastLayoutWasTrash = false;
            this.inputEditor.layout(dimension);
            this.renderValidation();
            if (this.shouldFocusAfterLayout) {
                this.shouldFocusAfterLayout = false;
                this.focus();
            }
        }
        focus() {
            if (this.lastLayoutWasTrash) {
                this.lastLayoutWasTrash = false;
                this.shouldFocusAfterLayout = true;
                return;
            }
            this.inputEditor.focus();
            this.editorContainer.classList.add('synthetic-focus');
        }
        hasFocus() {
            return this.inputEditor.hasTextFocus();
        }
        renderValidation() {
            var _a, _b, _c;
            this.validationDisposable.dispose();
            this.editorContainer.classList.toggle('validation-info', ((_a = this.validation) === null || _a === void 0 ? void 0 : _a.type) === 2 /* Information */);
            this.editorContainer.classList.toggle('validation-warning', ((_b = this.validation) === null || _b === void 0 ? void 0 : _b.type) === 1 /* Warning */);
            this.editorContainer.classList.toggle('validation-error', ((_c = this.validation) === null || _c === void 0 ? void 0 : _c.type) === 0 /* Error */);
            if (!this.validation || !this.inputEditor.hasTextFocus()) {
                return;
            }
            this.validationDisposable = this.contextViewService.showContextView({
                getAnchor: () => this.editorContainer,
                render: container => {
                    const element = (0, dom_1.append)(container, (0, dom_1.$)('.scm-editor-validation'));
                    element.classList.toggle('validation-info', this.validation.type === 2 /* Information */);
                    element.classList.toggle('validation-warning', this.validation.type === 1 /* Warning */);
                    element.classList.toggle('validation-error', this.validation.type === 0 /* Error */);
                    element.style.width = `${this.editorContainer.clientWidth}px`;
                    element.textContent = this.validation.message;
                    return lifecycle_1.Disposable.None;
                },
                anchorAlignment: 0 /* LEFT */
            });
        }
        getInputEditorFontFamily() {
            const inputFontFamily = this.configurationService.getValue('scm.inputFontFamily').trim();
            if (inputFontFamily.toLowerCase() === 'editor') {
                return this.configurationService.getValue('editor.fontFamily').trim();
            }
            if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
                return inputFontFamily;
            }
            return this.defaultInputFontFamily;
        }
        getInputEditorFontSize() {
            return this.configurationService.getValue('scm.inputFontSize');
        }
        computeLineHeight(fontSize) {
            return Math.round(fontSize * 1.5);
        }
        setPlaceholderFontStyles(fontFamily, fontSize, lineHeight) {
            this.placeholderTextContainer.style.fontFamily = fontFamily;
            this.placeholderTextContainer.style.fontSize = `${fontSize}px`;
            this.placeholderTextContainer.style.lineHeight = `${lineHeight}px`;
        }
        clearValidation() {
            this.validationDisposable.dispose();
        }
        dispose() {
            this.input = undefined;
            this.repositoryDisposables.dispose();
            this.validationDisposable.dispose();
            super.dispose();
        }
    };
    SCMInputWidget.ValidationTimeouts = {
        [2 /* Information */]: 5000,
        [1 /* Warning */]: 8000,
        [0 /* Error */]: 10000
    };
    SCMInputWidget = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, modelService_1.IModelService),
        __param(4, modeService_1.IModeService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, scm_1.ISCMViewService),
        __param(9, contextView_1.IContextViewService)
    ], SCMInputWidget);
    let SCMViewPane = class SCMViewPane extends viewPane_1.ViewPane {
        constructor(options, scmService, scmViewService, keybindingService, themeService, contextMenuService, commandService, editorService, instantiationService, viewDescriptorService, configurationService, contextKeyService, menuService, storageService, openerService, telemetryService) {
            super(Object.assign(Object.assign({}, options), { titleMenuId: actions_1.MenuId.SCMTitle }), keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.scmService = scmService;
            this.scmViewService = scmViewService;
            this.commandService = commandService;
            this.editorService = editorService;
            this.menuService = menuService;
            this.storageService = storageService;
            this._onDidLayout = new event_1.Emitter();
            this.layoutCache = {
                height: undefined,
                width: undefined,
                onDidChange: this._onDidLayout.event
            };
            this._register(event_1.Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire()));
        }
        get viewModel() { return this._viewModel; }
        renderBody(container) {
            super.renderBody(container);
            // List
            this.listContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-view.show-file-icons'));
            const overflowWidgetsDomNode = (0, dom_1.$)('.scm-overflow-widgets-container.monaco-editor');
            const updateActionsVisibility = () => this.listContainer.classList.toggle('show-actions', this.configurationService.getValue('scm.alwaysShowActions'));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'))(updateActionsVisibility));
            updateActionsVisibility();
            const updateProviderCountVisibility = () => {
                const value = this.configurationService.getValue('scm.providerCountBadge');
                this.listContainer.classList.toggle('hide-provider-counts', value === 'hidden');
                this.listContainer.classList.toggle('auto-provider-counts', value === 'auto');
            };
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'))(updateProviderCountVisibility));
            updateProviderCountVisibility();
            this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => this.tree.updateElementHeight(input, height));
            const delegate = new ListDelegate(this.inputRenderer);
            this.listLabels = this.instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._register(this.listLabels);
            const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
            this._register(actionRunner);
            this._register(actionRunner.onBeforeRun(() => this.tree.domFocus()));
            const renderers = [
                this.instantiationService.createInstance(scmRepositoryRenderer_1.RepositoryRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.inputRenderer,
                this.instantiationService.createInstance(ResourceGroupRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService)),
                this.instantiationService.createInstance(ResourceRenderer, () => this._viewModel, this.listLabels, (0, util_1.getActionViewItemProvider)(this.instantiationService), actionRunner)
            ];
            const filter = new SCMTreeFilter();
            const sorter = new SCMTreeSorter(() => this._viewModel);
            const keyboardNavigationLabelProvider = this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this._viewModel);
            const identityProvider = new SCMResourceIdentityProvider();
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchCompressibleObjectTree, 'SCM Tree Repo', this.listContainer, delegate, renderers, {
                transformOptimization: false,
                identityProvider,
                horizontalScrolling: false,
                setRowLineHeight: false,
                filter,
                sorter,
                keyboardNavigationLabelProvider,
                overrideStyles: {
                    listBackground: this.viewDescriptorService.getViewLocationById(this.id) === 0 /* Sidebar */ ? theme_1.SIDE_BAR_BACKGROUND : theme_1.PANEL_BACKGROUND
                },
                accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider)
            });
            this._register(this.tree.onDidOpen(this.open, this));
            this._register(this.tree.onContextMenu(this.onListContextMenu, this));
            this._register(this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer));
            this._register(this.tree);
            (0, dom_1.append)(this.listContainer, overflowWidgetsDomNode);
            let viewMode = this.configurationService.getValue('scm.defaultViewMode') === 'list' ? "list" /* List */ : "tree" /* Tree */;
            const storageMode = this.storageService.get(`scm.viewMode`, 1 /* WORKSPACE */);
            if (typeof storageMode === 'string') {
                viewMode = storageMode;
            }
            let viewState;
            const storageViewState = this.storageService.get(`scm.viewState`, 1 /* WORKSPACE */);
            if (storageViewState) {
                try {
                    viewState = JSON.parse(storageViewState);
                }
                catch ( /* noop */_a) { /* noop */ }
            }
            this._register(this.instantiationService.createInstance(RepositoryVisibilityActionController));
            this._viewModel = this.instantiationService.createInstance(ViewModel, this.tree, this.inputRenderer, viewMode, viewState);
            this._register(this._viewModel);
            this.listContainer.classList.add('file-icon-themable-tree');
            this.listContainer.classList.add('show-file-icons');
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this._register(this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this));
            this._register(this._viewModel.onDidChangeMode(this.onDidChangeMode, this));
            this._register(this.onDidChangeBodyVisibility(this._viewModel.setVisible, this._viewModel));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'))(this.updateActions, this));
            this.updateActions();
            this._register(this.storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.storageService.store(`scm.viewState`, JSON.stringify(this._viewModel.treeViewState), 1 /* WORKSPACE */, 1 /* MACHINE */);
                }
            }));
        }
        updateIndentStyles(theme) {
            this.listContainer.classList.toggle('list-view-mode', this._viewModel.mode === "list" /* List */);
            this.listContainer.classList.toggle('tree-view-mode', this._viewModel.mode === "tree" /* Tree */);
            this.listContainer.classList.toggle('align-icons-and-twisties', (this._viewModel.mode === "list" /* List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
            this.listContainer.classList.toggle('hide-arrows', this._viewModel.mode === "tree" /* Tree */ && theme.hidesExplorerArrows === true);
        }
        onDidChangeMode() {
            this.updateIndentStyles(this.themeService.getFileIconTheme());
            this.storageService.store(`scm.viewMode`, this._viewModel.mode, 1 /* WORKSPACE */, 0 /* USER */);
        }
        layoutBody(height = this.layoutCache.height, width = this.layoutCache.width) {
            if (height === undefined) {
                return;
            }
            if (width !== undefined) {
                super.layoutBody(height, width);
            }
            this.layoutCache.height = height;
            this.layoutCache.width = width;
            this._onDidLayout.fire();
            this.listContainer.style.height = `${height}px`;
            this.tree.layout(height, width);
        }
        focus() {
            super.focus();
            if (this.isExpanded()) {
                this._viewModel.focus();
            }
        }
        async open(e) {
            var _a, _b;
            if (!e.element) {
                return;
            }
            else if ((0, util_1.isSCMRepository)(e.element)) {
                this.scmViewService.focus(e.element);
                return;
            }
            else if ((0, util_1.isSCMResourceGroup)(e.element)) {
                const provider = e.element.provider;
                const repository = this.scmService.repositories.find(r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(e.element)) {
                const provider = e.element.context.provider;
                const repository = this.scmService.repositories.find(r => r.provider === provider);
                if (repository) {
                    this.scmViewService.focus(repository);
                }
                return;
            }
            else if ((0, util_1.isSCMInput)(e.element)) {
                this.scmViewService.focus(e.element.repository);
                const widget = this.inputRenderer.getRenderedInputWidget(e.element);
                if (widget) {
                    widget.focus();
                    const selection = this.tree.getSelection();
                    if (selection.length === 1 && selection[0] === e.element) {
                        setTimeout(() => this.tree.setSelection([]));
                    }
                }
                return;
            }
            // ISCMResource
            if (((_a = e.element.command) === null || _a === void 0 ? void 0 : _a.id) === editorCommands_1.API_OPEN_EDITOR_COMMAND_ID || ((_b = e.element.command) === null || _b === void 0 ? void 0 : _b.id) === editorCommands_1.API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                await this.commandService.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
            }
            else {
                await e.element.open(!!e.editorOptions.preserveFocus);
                if (e.editorOptions.pinned) {
                    const activeEditorPane = this.editorService.activeEditorPane;
                    if (activeEditorPane) {
                        activeEditorPane.group.pinEditor(activeEditorPane.input);
                    }
                }
            }
            const provider = e.element.resourceGroup.provider;
            const repository = this.scmService.repositories.find(r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
        }
        onListContextMenu(e) {
            if (!e.element) {
                const menu = this.menuService.createMenu(Menus.ViewSort, this.contextKeyService);
                const actions = [];
                const disposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
                return this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    onHide: () => {
                        disposable.dispose();
                        menu.dispose();
                    }
                });
            }
            const element = e.element;
            let context = element;
            let actions = [];
            let disposable = lifecycle_1.Disposable.None;
            if ((0, util_1.isSCMRepository)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.repositoryMenu;
                context = element.provider;
                [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
            }
            else if ((0, util_1.isSCMInput)(element)) {
                // noop
            }
            else if ((0, util_1.isSCMResourceGroup)(element)) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
                const menu = menus.getResourceGroupMenu(element);
                [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
            }
            else if (resourceTree_1.ResourceTree.isResourceNode(element)) {
                if (element.element) {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                    const menu = menus.getResourceMenu(element.element);
                    [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
                }
                else {
                    const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
                    const menu = menus.getResourceFolderMenu(element.context);
                    [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
                }
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element);
                [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
            }
            const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
            actionRunner.onBeforeRun(() => this.tree.domFocus());
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => context,
                actionRunner,
                onHide() {
                    disposable.dispose();
                }
            });
        }
        getSelectedResources() {
            return this.tree.getSelection()
                .filter(r => !!r && !(0, util_1.isSCMResourceGroup)(r));
        }
        shouldShowWelcome() {
            return this.scmService.repositories.length === 0;
        }
    };
    SCMViewPane = __decorate([
        __param(1, scm_1.ISCMService),
        __param(2, scm_1.ISCMViewService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, commands_1.ICommandService),
        __param(7, editorService_1.IEditorService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, actions_1.IMenuService),
        __param(13, storage_1.IStorageService),
        __param(14, opener_1.IOpenerService),
        __param(15, telemetry_1.ITelemetryService)
    ], SCMViewPane);
    exports.SCMViewPane = SCMViewPane;
    exports.scmProviderSeparatorBorderColor = (0, colorRegistry_1.registerColor)('scm.providerBorder', { dark: '#454545', light: '#C8C8C8', hc: colorRegistry_1.contrastBorder }, (0, nls_1.localize)(11, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const inputBackgroundColor = theme.getColor(colorRegistry_1.inputBackground);
        if (inputBackgroundColor) {
            collector.addRule(`.scm-view .scm-editor-container .monaco-editor-background,
		.scm-view .scm-editor-container .monaco-editor,
		.scm-view .scm-editor-container .monaco-editor .margin
		{ background-color: ${inputBackgroundColor} !important; }`);
        }
        const inputForegroundColor = theme.getColor(colorRegistry_1.inputForeground);
        if (inputForegroundColor) {
            collector.addRule(`.scm-view .scm-editor-container .mtk1 { color: ${inputForegroundColor}; }`);
        }
        const inputBorderColor = theme.getColor(colorRegistry_1.inputBorder);
        if (inputBorderColor) {
            collector.addRule(`.scm-view .scm-editor-container { outline: 1px solid ${inputBorderColor}; }`);
        }
        const panelInputBorder = theme.getColor(theme_1.PANEL_INPUT_BORDER);
        if (panelInputBorder) {
            collector.addRule(`.monaco-workbench .part.panel .scm-view .scm-editor-container { outline: 1px solid ${panelInputBorder}; }`);
        }
        const focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusBorderColor) {
            collector.addRule(`.scm-view .scm-editor-container.synthetic-focus { outline: 1px solid ${focusBorderColor}; }`);
        }
        const inputPlaceholderForegroundColor = theme.getColor(colorRegistry_1.inputPlaceholderForeground);
        if (inputPlaceholderForegroundColor) {
            collector.addRule(`.scm-view .scm-editor-placeholder { color: ${inputPlaceholderForegroundColor}; }`);
        }
        const inputValidationInfoBorderColor = theme.getColor(colorRegistry_1.inputValidationInfoBorder);
        if (inputValidationInfoBorderColor) {
            collector.addRule(`.scm-view .scm-editor-container.validation-info { outline: 1px solid ${inputValidationInfoBorderColor} !important; }`);
            collector.addRule(`.scm-editor-validation.validation-info { border-color: ${inputValidationInfoBorderColor}; }`);
        }
        const inputValidationInfoBackgroundColor = theme.getColor(colorRegistry_1.inputValidationInfoBackground);
        if (inputValidationInfoBackgroundColor) {
            collector.addRule(`.scm-editor-validation.validation-info { background-color: ${inputValidationInfoBackgroundColor}; }`);
        }
        const inputValidationInfoForegroundColor = theme.getColor(colorRegistry_1.inputValidationInfoForeground);
        if (inputValidationInfoForegroundColor) {
            collector.addRule(`.scm-editor-validation.validation-info { color: ${inputValidationInfoForegroundColor}; }`);
        }
        const inputValidationWarningBorderColor = theme.getColor(colorRegistry_1.inputValidationWarningBorder);
        if (inputValidationWarningBorderColor) {
            collector.addRule(`.scm-view .scm-editor-container.validation-warning { outline: 1px solid ${inputValidationWarningBorderColor} !important; }`);
            collector.addRule(`.scm-editor-validation.validation-warning { border-color: ${inputValidationWarningBorderColor}; }`);
        }
        const inputValidationWarningBackgroundColor = theme.getColor(colorRegistry_1.inputValidationWarningBackground);
        if (inputValidationWarningBackgroundColor) {
            collector.addRule(`.scm-editor-validation.validation-warning { background-color: ${inputValidationWarningBackgroundColor}; }`);
        }
        const inputValidationWarningForegroundColor = theme.getColor(colorRegistry_1.inputValidationWarningForeground);
        if (inputValidationWarningForegroundColor) {
            collector.addRule(`.scm-editor-validation.validation-warning { color: ${inputValidationWarningForegroundColor}; }`);
        }
        const inputValidationErrorBorderColor = theme.getColor(colorRegistry_1.inputValidationErrorBorder);
        if (inputValidationErrorBorderColor) {
            collector.addRule(`.scm-view .scm-editor-container.validation-error { outline: 1px solid ${inputValidationErrorBorderColor} !important; }`);
            collector.addRule(`.scm-editor-validation.validation-error { border-color: ${inputValidationErrorBorderColor}; }`);
        }
        const inputValidationErrorBackgroundColor = theme.getColor(colorRegistry_1.inputValidationErrorBackground);
        if (inputValidationErrorBackgroundColor) {
            collector.addRule(`.scm-editor-validation.validation-error { background-color: ${inputValidationErrorBackgroundColor}; }`);
        }
        const inputValidationErrorForegroundColor = theme.getColor(colorRegistry_1.inputValidationErrorForeground);
        if (inputValidationErrorForegroundColor) {
            collector.addRule(`.scm-editor-validation.validation-error { color: ${inputValidationErrorForegroundColor}; }`);
        }
        const repositoryStatusActionsBorderColor = theme.getColor(theme_1.SIDE_BAR_BORDER);
        if (repositoryStatusActionsBorderColor) {
            collector.addRule(`.scm-view .scm-provider > .status > .monaco-action-bar > .actions-container { border-color: ${repositoryStatusActionsBorderColor}; }`);
        }
    });
});
//# sourceMappingURL=scmViewPane.js.map