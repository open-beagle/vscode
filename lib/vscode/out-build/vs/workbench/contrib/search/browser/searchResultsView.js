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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/countBadge/countBadge", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/resources", "vs/nls!vs/workbench/contrib/search/browser/searchResultsView", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/search/browser/searchActions", "vs/workbench/contrib/search/common/searchModel", "vs/workbench/browser/dnd"], function (require, exports, DOM, actionbar_1, countBadge_1, lifecycle_1, paths, resources, nls, configuration_1, files_1, instantiation_1, label_1, styler_1, themeService_1, workspace_1, searchActions_1, searchModel_1, dnd_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchDND = exports.SearchAccessibilityProvider = exports.MatchRenderer = exports.FileMatchRenderer = exports.FolderMatchRenderer = exports.SearchDelegate = void 0;
    class SearchDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return FolderMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.FileMatch) {
                return FileMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.Match) {
                return MatchRenderer.TEMPLATE_ID;
            }
            console.error('Invalid search tree element', element);
            throw new Error('Invalid search tree element');
        }
    }
    exports.SearchDelegate = SearchDelegate;
    let FolderMatchRenderer = class FolderMatchRenderer extends lifecycle_1.Disposable {
        constructor(searchModel, searchView, labels, instantiationService, themeService, contextService) {
            super();
            this.searchModel = searchModel;
            this.searchView = searchView;
            this.labels = labels;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.contextService = contextService;
            this.templateId = FolderMatchRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const disposables = [];
            const folderMatchElement = DOM.append(container, DOM.$('.foldermatch'));
            const label = this.labels.create(folderMatchElement);
            disposables.push(label);
            const badge = new countBadge_1.CountBadge(DOM.append(folderMatchElement, DOM.$('.badge')));
            disposables.push((0, styler_1.attachBadgeStyler)(badge, this.themeService));
            const actionBarContainer = DOM.append(folderMatchElement, DOM.$('.actionBarContainer'));
            const actions = new actionbar_1.ActionBar(actionBarContainer, { animated: false });
            disposables.push(actions);
            return {
                label,
                badge,
                actions,
                disposables
            };
        }
        renderElement(node, index, templateData) {
            const folderMatch = node.element;
            if (folderMatch.resource) {
                const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
                if (workspaceFolder && resources.isEqual(workspaceFolder.uri, folderMatch.resource)) {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.ROOT_FOLDER, hidePath: true });
                }
                else {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.FOLDER });
                }
            }
            else {
                templateData.label.setLabel(nls.localize(0, null));
            }
            const count = folderMatch.fileCount();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize(1, null, count) : nls.localize(2, null, count));
            templateData.actions.clear();
            const actions = [];
            if (this.searchModel.isReplaceActive() && count > 0) {
                actions.push(this.instantiationService.createInstance(searchActions_1.ReplaceAllInFolderAction, this.searchView.getControl(), folderMatch));
            }
            actions.push(new searchActions_1.RemoveAction(this.searchView.getControl(), folderMatch));
            templateData.actions.push(actions, { icon: true, label: false });
        }
        disposeElement(element, index, templateData) {
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.disposables);
        }
    };
    FolderMatchRenderer.TEMPLATE_ID = 'folderMatch';
    FolderMatchRenderer = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, workspace_1.IWorkspaceContextService)
    ], FolderMatchRenderer);
    exports.FolderMatchRenderer = FolderMatchRenderer;
    let FileMatchRenderer = class FileMatchRenderer extends lifecycle_1.Disposable {
        constructor(searchModel, searchView, labels, instantiationService, themeService, contextService) {
            super();
            this.searchModel = searchModel;
            this.searchView = searchView;
            this.labels = labels;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.contextService = contextService;
            this.templateId = FileMatchRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            const disposables = [];
            const fileMatchElement = DOM.append(container, DOM.$('.filematch'));
            const label = this.labels.create(fileMatchElement);
            disposables.push(label);
            const badge = new countBadge_1.CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')));
            disposables.push((0, styler_1.attachBadgeStyler)(badge, this.themeService));
            const actionBarContainer = DOM.append(fileMatchElement, DOM.$('.actionBarContainer'));
            const actions = new actionbar_1.ActionBar(actionBarContainer, { animated: false });
            disposables.push(actions);
            return {
                el: fileMatchElement,
                label,
                badge,
                actions,
                disposables
            };
        }
        renderElement(node, index, templateData) {
            const fileMatch = node.element;
            templateData.el.setAttribute('data-resource', fileMatch.resource.toString());
            templateData.label.setFile(fileMatch.resource, { hideIcon: false });
            const count = fileMatch.count();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize(3, null, count) : nls.localize(4, null, count));
            templateData.actions.clear();
            const actions = [];
            if (this.searchModel.isReplaceActive() && count > 0) {
                actions.push(this.instantiationService.createInstance(searchActions_1.ReplaceAllAction, this.searchView, fileMatch));
            }
            actions.push(new searchActions_1.RemoveAction(this.searchView.getControl(), fileMatch));
            templateData.actions.push(actions, { icon: true, label: false });
        }
        disposeElement(element, index, templateData) {
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.disposables);
        }
    };
    FileMatchRenderer.TEMPLATE_ID = 'fileMatch';
    FileMatchRenderer = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, workspace_1.IWorkspaceContextService)
    ], FileMatchRenderer);
    exports.FileMatchRenderer = FileMatchRenderer;
    let MatchRenderer = class MatchRenderer extends lifecycle_1.Disposable {
        constructor(searchModel, searchView, instantiationService, contextService, configurationService) {
            super();
            this.searchModel = searchModel;
            this.searchView = searchView;
            this.instantiationService = instantiationService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.templateId = MatchRenderer.TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('linematch');
            const parent = DOM.append(container, DOM.$('a.plain.match'));
            const before = DOM.append(parent, DOM.$('span'));
            const match = DOM.append(parent, DOM.$('span.findInFileMatch'));
            const replace = DOM.append(parent, DOM.$('span.replaceMatch'));
            const after = DOM.append(parent, DOM.$('span'));
            const lineNumber = DOM.append(container, DOM.$('span.matchLineNum'));
            const actionBarContainer = DOM.append(container, DOM.$('span.actionBarContainer'));
            const actions = new actionbar_1.ActionBar(actionBarContainer, { animated: false });
            return {
                parent,
                before,
                match,
                replace,
                after,
                lineNumber,
                actions
            };
        }
        renderElement(node, index, templateData) {
            const match = node.element;
            const preview = match.preview();
            const replace = this.searchModel.isReplaceActive() && !!this.searchModel.replaceString;
            templateData.before.textContent = preview.before;
            templateData.match.textContent = preview.inside;
            templateData.match.classList.toggle('replace', replace);
            templateData.replace.textContent = replace ? match.replaceString : '';
            templateData.after.textContent = preview.after;
            templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const extraLinesStr = numLines > 0 ? `+${numLines}` : '';
            const showLineNumbers = this.configurationService.getValue('search').showLineNumbers;
            const lineNumberStr = showLineNumbers ? `:${match.range().startLineNumber}` : '';
            templateData.lineNumber.classList.toggle('show', (numLines > 0) || showLineNumbers);
            templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
            templateData.lineNumber.setAttribute('title', this.getMatchTitle(match, showLineNumbers));
            templateData.actions.clear();
            if (this.searchModel.isReplaceActive()) {
                templateData.actions.push([this.instantiationService.createInstance(searchActions_1.ReplaceAction, this.searchView.getControl(), match, this.searchView), new searchActions_1.RemoveAction(this.searchView.getControl(), match)], { icon: true, label: false });
            }
            else {
                templateData.actions.push([new searchActions_1.RemoveAction(this.searchView.getControl(), match)], { icon: true, label: false });
            }
        }
        disposeElement(element, index, templateData) {
        }
        disposeTemplate(templateData) {
            templateData.actions.dispose();
        }
        getMatchTitle(match, showLineNumbers) {
            const startLine = match.range().startLineNumber;
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const lineNumStr = showLineNumbers ?
                nls.localize(5, null, startLine, numLines) + ' ' :
                '';
            const numLinesStr = numLines > 0 ?
                '+ ' + nls.localize(6, null, numLines) :
                '';
            return lineNumStr + numLinesStr;
        }
    };
    MatchRenderer.TEMPLATE_ID = 'match';
    MatchRenderer = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, configuration_1.IConfigurationService)
    ], MatchRenderer);
    exports.MatchRenderer = MatchRenderer;
    let SearchAccessibilityProvider = class SearchAccessibilityProvider {
        constructor(searchModel, labelService) {
            this.searchModel = searchModel;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return nls.localize(7, null);
        }
        getAriaLabel(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return element.resource ?
                    nls.localize(8, null, element.count(), element.name()) :
                    nls.localize(9, null, element.count());
            }
            if (element instanceof searchModel_1.FileMatch) {
                const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return nls.localize(10, null, element.count(), element.name(), paths.dirname(path));
            }
            if (element instanceof searchModel_1.Match) {
                const match = element;
                const searchModel = this.searchModel;
                const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
                const matchString = match.getMatchString();
                const range = match.range();
                const matchText = match.text().substr(0, range.endColumn + 150);
                if (replace) {
                    return nls.localize(11, null, matchString, match.replaceString, range.startColumn + 1, matchText);
                }
                return nls.localize(12, null, matchString, range.startColumn + 1, matchText);
            }
            return null;
        }
    };
    SearchAccessibilityProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SearchAccessibilityProvider);
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider;
    let SearchDND = class SearchDND {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return false;
        }
        getDragURI(element) {
            if (element instanceof searchModel_1.FileMatch) {
                return element.remove.toString();
            }
            return null;
        }
        getDragLabel(elements) {
            if (elements.length > 1) {
                return String(elements.length);
            }
            const element = elements[0];
            return element instanceof searchModel_1.FileMatch ?
                resources.basename(element.resource) :
                undefined;
        }
        onDragStart(data, originalEvent) {
            const elements = data.elements;
            const resources = elements
                .filter((e) => e instanceof searchModel_1.FileMatch)
                .map((fm) => fm.resource);
            if (resources.length) {
                // Apply some datatransfer types to allow for dragging the element outside of the application
                this.instantiationService.invokeFunction(dnd_1.fillResourceDataTransfers, resources, undefined, originalEvent);
            }
        }
        drop(data, targetElement, targetIndex, originalEvent) {
        }
    };
    SearchDND = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], SearchDND);
    exports.SearchDND = SearchDND;
});
//# sourceMappingURL=searchResultsView.js.map