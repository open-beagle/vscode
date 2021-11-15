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
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/browser/gettingStarted", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/product/common/productService", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedService", "vs/platform/theme/common/themeService", "vs/workbench/contrib/welcome/page/browser/welcomePageColors", "vs/platform/theme/common/colorRegistry", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedIcons", "vs/platform/opener/common/opener", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/experiment/common/experimentService", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/base/common/errors", "vs/platform/label/common/label", "vs/base/common/labels", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/async", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/quickinput/common/quickInput", "vs/base/common/event", "vs/base/browser/ui/button/button", "vs/platform/theme/common/styler", "vs/platform/opener/browser/link", "vs/base/browser/formattedTextRenderer", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/markdown/common/markdownDocumentRenderer", "vs/editor/common/services/modeService", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uuid", "vs/editor/common/modes", "vs/editor/common/modes/supports/tokenization", "vs/base/common/map", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/contrib/webview/common/webviewUri", "vs/workbench/services/environment/common/environmentService", "vs/css!./gettingStarted"], function (require, exports, nls_1, instantiation_1, lifecycle_1, types_1, dom_1, commands_1, productService_1, gettingStartedService_1, themeService_1, welcomePageColors_1, colorRegistry_1, keybinding_1, telemetry_1, scrollableElement_1, gettingStartedIcons_1, opener_1, editorPane_1, storage_1, configuration_1, contextkey_1, experimentService_1, workspaces_1, workspace_1, errors_1, label_1, labels_1, host_1, platform_1, async_1, gettingStartedInput_1, editorGroupsService_1, quickInput_1, event_1, button_1, styler_1, link_1, formattedTextRenderer_1, webview_1, markdownDocumentRenderer_1, modeService_1, extensions_1, uuid_1, modes_1, tokenization_1, map_1, files_1, resources_1, webviewUri_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedInputSerializer = exports.GettingStartedPage = exports.inGettingStartedContext = void 0;
    const SLIDE_TRANSITION_TIME_MS = 250;
    const configurationKey = 'workbench.startupEditor';
    const hiddenEntriesConfigurationKey = 'workbench.welcomePage.hiddenCategories';
    exports.inGettingStartedContext = new contextkey_1.RawContextKey('inGettingStarted', false);
    let GettingStartedPage = class GettingStartedPage extends editorPane_1.EditorPane {
        constructor(commandService, productService, keybindingService, gettingStartedService, configurationService, telemetryService, modeService, fileService, openerService, themeService, storageService, extensionService, instantiationService, environmentService, groupsService, contextService, quickInputService, workspacesService, labelService, hostService, webviewService, workspaceContextService, tasExperimentService) {
            super(GettingStartedPage.ID, telemetryService, themeService, storageService);
            this.commandService = commandService;
            this.productService = productService;
            this.keybindingService = keybindingService;
            this.gettingStartedService = gettingStartedService;
            this.configurationService = configurationService;
            this.modeService = modeService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.instantiationService = instantiationService;
            this.environmentService = environmentService;
            this.groupsService = groupsService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.hostService = hostService;
            this.webviewService = webviewService;
            this.workspaceContextService = workspaceContextService;
            this.inProgressScroll = Promise.resolve();
            this.dispatchListeners = new lifecycle_1.DisposableStore();
            this.stepDisposables = new lifecycle_1.DisposableStore();
            this.detailsPageDisposables = new lifecycle_1.DisposableStore();
            this.buildSlideThrottle = new async_1.Throttler();
            this.hasScrolledToFirstCategory = false;
            this.webviewID = (0, uuid_1.generateUuid)();
            this.mdCache = new map_1.ResourceMap();
            this.container = (0, dom_1.$)('.gettingStartedContainer', {
                role: 'document',
                tabindex: 0,
                'aria-label': (0, nls_1.localize)(0, null)
            });
            this.stepMediaComponent = (0, dom_1.$)('.getting-started-media');
            this.stepMediaComponent.id = (0, uuid_1.generateUuid)();
            this.tasExperimentService = tasExperimentService;
            this.contextService = this._register(contextService.createScoped(this.container));
            exports.inGettingStartedContext.bindTo(this.contextService).set(true);
            this.gettingStartedCategories = this.gettingStartedService.getCategories();
            this._register(this.dispatchListeners);
            this.buildSlideThrottle = new async_1.Throttler();
            const rerender = () => {
                this.gettingStartedCategories = this.gettingStartedService.getCategories();
                this.buildSlideThrottle.queue(() => this.buildCategoriesSlide());
            };
            this._register(this.gettingStartedService.onDidAddCategory(rerender));
            this._register(this.gettingStartedService.onDidRemoveCategory(rerender));
            this._register(this.gettingStartedService.onDidChangeStep(step => {
                const ourCategory = this.gettingStartedCategories.find(c => c.id === step.category);
                if (!ourCategory || ourCategory.content.type === 'startEntry') {
                    return;
                }
                const ourStep = ourCategory.content.steps.find(step => step.id === step.id);
                if (!ourStep) {
                    return;
                }
                ourStep.title = step.title;
                ourStep.description = step.description;
                ourStep.media.path = step.media.path;
                this.container.querySelectorAll(`[x-step-title-for="${step.id}"]`).forEach(element => element.innerText = step.title);
                this.container.querySelectorAll(`[x-step-description-for="${step.id}"]`).forEach(element => this.buildStepMarkdownDescription((element), step.description));
            }));
            this._register(this.gettingStartedService.onDidChangeCategory(category => {
                const ourCategory = this.gettingStartedCategories.find(c => c.id === category.id);
                if (!ourCategory) {
                    return;
                }
                ourCategory.title = category.title;
                ourCategory.description = category.description;
                this.container.querySelectorAll(`[x-category-title-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.title);
                this.container.querySelectorAll(`[x-category-description-for="${category.id}"]`).forEach(step => step.innerText = ourCategory.description);
            }));
            this._register(this.gettingStartedService.onDidProgressStep(step => {
                var _a;
                const category = this.gettingStartedCategories.find(category => category.id === step.category);
                if (!category) {
                    throw Error('Could not find category with ID: ' + step.category);
                }
                if (category.content.type !== 'steps') {
                    throw Error('internal error: progressing step in a non-steps category');
                }
                const ourStep = category.content.steps.find(_step => _step.id === step.id);
                if (!ourStep) {
                    throw Error('Could not find step with ID: ' + step.id);
                }
                ourStep.done = step.done;
                if (category.id === ((_a = this.currentCategory) === null || _a === void 0 ? void 0 : _a.id)) {
                    const badgeelements = (0, types_1.assertIsDefined)(document.querySelectorAll(`[data-done-step-id="${step.id}"]`));
                    badgeelements.forEach(badgeelement => {
                        var _a, _b;
                        if (step.done) {
                            (_a = badgeelement.parentElement) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-checked', 'true');
                            badgeelement.classList.remove(...themeService_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                            badgeelement.classList.add('complete', ...themeService_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                        }
                        else {
                            (_b = badgeelement.parentElement) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-checked', 'false');
                            badgeelement.classList.remove('complete', ...themeService_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedCheckedCodicon));
                            badgeelement.classList.add(...themeService_1.ThemeIcon.asClassNameArray(gettingStartedIcons_1.gettingStartedUncheckedCodicon));
                        }
                    });
                }
                this.updateCategoryProgress();
            }));
            this.recentlyOpened = workspacesService.getRecentlyOpened();
        }
        async setInput(newInput, options, context, token) {
            this.container.classList.remove('animationReady');
            this.editorInput = newInput;
            await super.setInput(newInput, options, context, token);
            await this.buildCategoriesSlide();
            setTimeout(() => this.container.classList.add('animationReady'), 0);
        }
        makeCategoryVisibleWhenAvailable(categoryID) {
            this.gettingStartedCategories = this.gettingStartedService.getCategories();
            const ourCategory = this.gettingStartedCategories.find(c => c.id === categoryID);
            if (!ourCategory) {
                throw Error('Could not find category with ID: ' + categoryID);
            }
            if (ourCategory.content.type !== 'steps') {
                throw Error('internaal error: category is not steps');
            }
            this.scrollToCategory(categoryID);
        }
        registerDispatchListeners() {
            this.dispatchListeners.clear();
            this.container.querySelectorAll('[x-dispatch]').forEach(element => {
                var _a;
                const [command, argument] = ((_a = element.getAttribute('x-dispatch')) !== null && _a !== void 0 ? _a : '').split(':');
                if (command) {
                    this.dispatchListeners.add((0, dom_1.addDisposableListener)(element, 'click', (e) => {
                        this.commandService.executeCommand('workbench.action.keepEditor');
                        this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command, argument });
                        (async () => {
                            var _a;
                            switch (command) {
                                case 'scrollPrev': {
                                    this.scrollPrev();
                                    break;
                                }
                                case 'skip': {
                                    this.runSkip();
                                    break;
                                }
                                case 'showMoreRecents': {
                                    this.commandService.executeCommand('workbench.action.openRecent');
                                    break;
                                }
                                case 'configureVisibility': {
                                    await this.configureCategoryVisibility();
                                    break;
                                }
                                case 'openFolder': {
                                    this.commandService.executeCommand(platform_1.isMacintosh ? 'workbench.action.files.openFileFolder' : 'workbench.action.files.openFolder');
                                    break;
                                }
                                case 'selectCategory': {
                                    const selectedCategory = this.gettingStartedCategories.find(category => category.id === argument);
                                    if (!selectedCategory) {
                                        throw Error('Could not find category with ID ' + argument);
                                    }
                                    if (selectedCategory.content.type === 'startEntry') {
                                        this.commandService.executeCommand(selectedCategory.content.command);
                                    }
                                    else {
                                        this.scrollToCategory(argument);
                                    }
                                    break;
                                }
                                case 'hideCategory': {
                                    const selectedCategory = this.gettingStartedCategories.find(category => category.id === argument);
                                    if (!selectedCategory) {
                                        throw Error('Could not find category with ID ' + argument);
                                    }
                                    this.setHiddenCategories([...this.getHiddenCategories().add(argument)]);
                                    (_a = this.gettingStartedList) === null || _a === void 0 ? void 0 : _a.rerender();
                                    break;
                                }
                                // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
                                case 'selectTask': {
                                    this.selectStep(argument);
                                    break;
                                }
                                case 'toggleStepCompletion': {
                                    this.toggleStepCompletion(argument);
                                    break;
                                }
                                default: {
                                    console.error('Dispatch to', command, argument, 'not defined');
                                    break;
                                }
                            }
                        })();
                        e.stopPropagation();
                    }));
                }
            });
        }
        toggleStepCompletion(argument) {
            var _a, _b;
            if (!this.currentCategory || this.currentCategory.content.type !== 'steps') {
                throw Error('cannot run step action for category of non steps type' + ((_a = this.currentCategory) === null || _a === void 0 ? void 0 : _a.id));
            }
            const stepToggle = (0, types_1.assertIsDefined)((_b = this.currentCategory) === null || _b === void 0 ? void 0 : _b.content.steps.find(step => step.id === argument));
            if (stepToggle.done) {
                this.gettingStartedService.deprogressStep(argument);
            }
            else {
                this.gettingStartedService.progressStep(argument);
            }
        }
        async configureCategoryVisibility() {
            const hiddenCategories = this.getHiddenCategories();
            const allCategories = this.gettingStartedCategories.filter(x => x.content.type === 'steps');
            const visibleCategories = await this.quickInputService.pick(allCategories.map(x => ({
                picked: !hiddenCategories.has(x.id),
                id: x.id,
                label: x.title,
                detail: x.description,
            })), { canPickMany: true, title: (0, nls_1.localize)(1, null) });
            if (visibleCategories) {
                const visibleIDs = new Set(visibleCategories.map(c => c.id));
                this.setHiddenCategories(allCategories.map(c => c.id).filter(id => !visibleIDs.has(id)));
                this.buildCategoriesSlide();
            }
        }
        async readAndCacheStepMarkdown(path) {
            if (!this.mdCache.has(path)) {
                this.mdCache.set(path, (async () => {
                    const bytes = await this.fileService.readFile(path);
                    const markdown = bytes.value.toString();
                    return (0, markdownDocumentRenderer_1.renderMarkdownDocument)(markdown, this.extensionService, this.modeService);
                })());
            }
            return (0, types_1.assertIsDefined)(this.mdCache.get(path));
        }
        getHiddenCategories() {
            return new Set(JSON.parse(this.storageService.get(hiddenEntriesConfigurationKey, 0 /* GLOBAL */, '[]')));
        }
        setHiddenCategories(hidden) {
            this.storageService.store(hiddenEntriesConfigurationKey, JSON.stringify(hidden), 0 /* GLOBAL */, 0 /* USER */);
        }
        async selectStep(id, toggleIfAlreadySelected = true, delayFocus = true) {
            var _a, _b, _c, _d;
            this.stepDisposables.clear();
            (0, dom_1.clearNode)(this.stepMediaComponent);
            if (id) {
                const stepElement = (0, types_1.assertIsDefined)(this.container.querySelector(`[data-step-id="${id}"]`));
                (_a = stepElement.parentElement) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.expanded').forEach(node => {
                    node.classList.remove('expanded');
                    node.style.height = ``;
                    node.setAttribute('aria-expanded', 'false');
                });
                setTimeout(() => stepElement.focus(), delayFocus ? SLIDE_TRANSITION_TIME_MS : 0);
                if (this.editorInput.selectedStep === id && toggleIfAlreadySelected) {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'toggleStepCompletion2', argument: id });
                    this.toggleStepCompletion(id);
                }
                stepElement.style.height = ``;
                stepElement.style.height = `${stepElement.scrollHeight}px`;
                if (!this.currentCategory || this.currentCategory.content.type !== 'steps') {
                    throw Error('cannot expand step for category of non steps type' + ((_b = this.currentCategory) === null || _b === void 0 ? void 0 : _b.id));
                }
                this.editorInput.selectedStep = id;
                this.selectedStepElement = stepElement;
                const stepToExpand = (0, types_1.assertIsDefined)(this.currentCategory.content.steps.find(step => step.id === id));
                if (stepToExpand.media.type === 'image') {
                    this.stepMediaComponent.classList.add('image');
                    this.stepMediaComponent.classList.remove('markdown');
                    const media = stepToExpand.media;
                    const mediaElement = (0, dom_1.$)('img');
                    this.stepMediaComponent.appendChild(mediaElement);
                    mediaElement.setAttribute('alt', media.altText);
                    this.updateMediaSourceForColorMode(mediaElement, media.path);
                    this.stepDisposables.add(this.themeService.onDidColorThemeChange(() => this.updateMediaSourceForColorMode(mediaElement, media.path)));
                }
                else if (stepToExpand.media.type === 'markdown') {
                    this.stepMediaComponent.classList.remove('image');
                    this.stepMediaComponent.classList.add('markdown');
                    const media = stepToExpand.media;
                    const webview = this.stepDisposables.add(this.webviewService.createWebviewElement(this.webviewID, {}, { localResourceRoots: [media.base] }, undefined));
                    webview.mountTo(this.stepMediaComponent);
                    webview.html = await this.renderMarkdown(media.path, media.base);
                    let isDisposed = false;
                    this.stepDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                    this.stepDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                        // Render again since syntax highlighting of code blocks may have changed
                        const body = await this.renderMarkdown(media.path, media.base);
                        if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                            webview.html = body;
                        }
                    }));
                }
                stepElement.classList.add('expanded');
                stepElement.setAttribute('aria-expanded', 'true');
            }
            else {
                this.editorInput.selectedStep = undefined;
            }
            setTimeout(() => {
                var _a, _b;
                // rescan after animation finishes
                (_a = this.detailsPageScrollbar) === null || _a === void 0 ? void 0 : _a.scanDomNode();
                (_b = this.detailsScrollbar) === null || _b === void 0 ? void 0 : _b.scanDomNode();
            }, 100);
            (_c = this.detailsPageScrollbar) === null || _c === void 0 ? void 0 : _c.scanDomNode();
            (_d = this.detailsScrollbar) === null || _d === void 0 ? void 0 : _d.scanDomNode();
        }
        updateMediaSourceForColorMode(element, sources) {
            const themeType = this.themeService.getColorTheme().type;
            element.srcset = sources[themeType].toString().replace(/ /g, '%20') + ' 1.5x';
        }
        async renderMarkdown(path, base) {
            const content = await this.readAndCacheStepMarkdown(path);
            const nonce = (0, uuid_1.generateUuid)();
            const colorMap = modes_1.TokenizationRegistry.getColorMap();
            const uriTranformedContent = content.replace(/src="([^"]*)"/g, (_, src) => {
                const path = (0, resources_1.joinPath)(base, src);
                const transformed = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.webviewID, path).toString();
                return `src="${transformed}"`;
            });
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}
					${css}
				</style>
			</head>
			<body>
				${uriTranformedContent}
			</body>
		</html>`;
        }
        createEditor(parent) {
            if (this.detailsPageScrollbar) {
                this.detailsPageScrollbar.dispose();
            }
            if (this.categoriesPageScrollbar) {
                this.categoriesPageScrollbar.dispose();
            }
            this.categoriesSlide = (0, dom_1.$)('.gettingStartedSlideCategories.gettingStartedSlide');
            const prevButton = (0, dom_1.$)('button.prev-button.button-link', { 'x-dispatch': 'scrollPrev' }, (0, dom_1.$)('span.scroll-button.codicon.codicon-chevron-left'), (0, dom_1.$)('span.moreText', {}, (0, nls_1.localize)(2, null)));
            this.stepsSlide = (0, dom_1.$)('.gettingStartedSlideDetails.gettingStartedSlide', {}, prevButton);
            this.stepsContent = (0, dom_1.$)('.gettingStartedDetailsContent', {});
            this.detailsPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.stepsContent, { className: 'full-height-scrollable' }));
            this.categoriesPageScrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.categoriesSlide, { className: 'full-height-scrollable categoriesScrollbar' }));
            this.stepsSlide.appendChild(this.detailsPageScrollbar.getDomNode());
            const gettingStartedPage = (0, dom_1.$)('.gettingStarted', {}, this.categoriesPageScrollbar.getDomNode(), this.stepsSlide);
            this.container.appendChild(gettingStartedPage);
            this.categoriesPageScrollbar.scanDomNode();
            this.detailsPageScrollbar.scanDomNode();
            parent.appendChild(this.container);
        }
        async buildCategoriesSlide() {
            var _a, _b, _c;
            const showOnStartupCheckbox = (0, dom_1.$)('input.checkbox', { id: 'showOnStartup', type: 'checkbox' });
            showOnStartupCheckbox.checked = this.configurationService.getValue(configurationKey) === 'gettingStarted';
            this._register((0, dom_1.addDisposableListener)(showOnStartupCheckbox, 'click', () => {
                if (showOnStartupCheckbox.checked) {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupChecked', argument: undefined });
                    this.configurationService.updateValue(configurationKey, 'gettingStarted');
                }
                else {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'showOnStartupUnchecked', argument: undefined });
                    this.configurationService.updateValue(configurationKey, 'none');
                }
            }));
            const header = (0, dom_1.$)('.header', {}, (0, dom_1.$)('h1.product-name.caption', {}, this.productService.nameLong), (0, dom_1.$)('p.subtitle.description', {}, (0, nls_1.localize)(3, null)));
            const footer = (0, dom_1.$)('.footer', {}, (0, dom_1.$)('p.showOnStartup', {}, showOnStartupCheckbox, (0, dom_1.$)('label.caption', { for: 'showOnStartup' }, (0, nls_1.localize)(4, null))), (0, dom_1.$)('p.configureVisibility', {}, (0, dom_1.$)('button.button-link', { 'x-dispatch': 'configureVisibility' }, (0, nls_1.localize)(5, null))));
            const leftColumn = (0, dom_1.$)('.categories-column.categories-column-left', {});
            const rightColumn = (0, dom_1.$)('.categories-column.categories-column-right', {});
            const startList = this.buildStartList();
            const recentList = this.buildRecentlyOpenedList();
            const gettingStartedList = this.buildGettingStartedWalkthroughsList();
            const layoutLists = () => {
                if (gettingStartedList.itemCount) {
                    (0, dom_1.reset)(leftColumn, startList.getDomElement(), recentList.getDomElement());
                    (0, dom_1.reset)(rightColumn, gettingStartedList.getDomElement());
                    recentList.setLimit(5);
                }
                else {
                    (0, dom_1.reset)(leftColumn, startList.getDomElement());
                    (0, dom_1.reset)(rightColumn, recentList.getDomElement());
                    recentList.setLimit(10);
                }
                setTimeout(() => { var _a; return (_a = this.categoriesPageScrollbar) === null || _a === void 0 ? void 0 : _a.scanDomNode(); }, 50);
            };
            gettingStartedList.onDidChange(layoutLists);
            layoutLists();
            (0, dom_1.reset)(this.categoriesSlide, (0, dom_1.$)('.gettingStartedCategoriesContainer', {}, header, leftColumn, rightColumn, footer));
            (_a = this.categoriesPageScrollbar) === null || _a === void 0 ? void 0 : _a.scanDomNode();
            this.updateCategoryProgress();
            this.registerDispatchListeners();
            if (this.editorInput.selectedCategory) {
                this.currentCategory = this.gettingStartedCategories.find(category => category.id === this.editorInput.selectedCategory);
                if (!this.currentCategory) {
                    console.error('Could not restore to category ' + this.editorInput.selectedCategory + ' as it was not found');
                    this.editorInput.selectedCategory = undefined;
                    this.editorInput.selectedStep = undefined;
                }
                else {
                    this.buildCategorySlide(this.editorInput.selectedCategory, this.editorInput.selectedStep);
                    this.setSlide('details');
                    return;
                }
            }
            const someStepsComplete = this.gettingStartedCategories.some(categry => categry.content.type === 'steps' && categry.content.stepsComplete);
            if (!someStepsComplete && !this.hasScrolledToFirstCategory) {
                const fistContentBehaviour = !this.storageService.get(telemetry_1.lastSessionDateStorageKey, 0 /* GLOBAL */) // isNewUser ?
                    ? 'openToFirstCategory'
                    : await Promise.race([
                        (_b = this.tasExperimentService) === null || _b === void 0 ? void 0 : _b.getTreatment('GettingStartedFirstContent'),
                        new Promise(resolve => setTimeout(() => resolve('index'), 1000)),
                    ]);
                if (this.gettingStartedCategories.some(category => category.content.type === 'steps' && category.content.stepsComplete)) {
                    this.setSlide('categories');
                    return;
                }
                else {
                    if (fistContentBehaviour === 'openToFirstCategory') {
                        const first = this.gettingStartedCategories.find(category => category.content.type === 'steps');
                        this.hasScrolledToFirstCategory = true;
                        if (first) {
                            this.currentCategory = first;
                            this.editorInput.selectedCategory = (_c = this.currentCategory) === null || _c === void 0 ? void 0 : _c.id;
                            this.buildCategorySlide(this.editorInput.selectedCategory);
                            this.setSlide('details');
                            return;
                        }
                    }
                }
            }
            this.setSlide('categories');
        }
        buildRecentlyOpenedList() {
            const renderRecent = (recent) => {
                let fullPath;
                let windowOpenable;
                if ((0, workspaces_1.isRecentFolder)(recent)) {
                    windowOpenable = { folderUri: recent.folderUri };
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: true });
                }
                else {
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: true });
                    windowOpenable = { workspaceUri: recent.workspace.configPath };
                }
                const { name, parentPath } = (0, labels_1.splitName)(fullPath);
                const li = (0, dom_1.$)('li');
                const link = (0, dom_1.$)('button.button-link');
                link.innerText = name;
                link.title = fullPath;
                link.setAttribute('aria-label', (0, nls_1.localize)(6, null, name, parentPath));
                link.addEventListener('click', e => {
                    this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'openRecent', argument: undefined });
                    this.hostService.openWindow([windowOpenable], { forceNewWindow: e.ctrlKey || e.metaKey, remoteAuthority: recent.remoteAuthority });
                    e.preventDefault();
                    e.stopPropagation();
                });
                li.appendChild(link);
                const span = (0, dom_1.$)('span');
                span.classList.add('path');
                span.classList.add('detail');
                span.innerText = parentPath;
                span.title = fullPath;
                li.appendChild(span);
                return li;
            };
            if (this.recentlyOpenedList) {
                this.recentlyOpenedList.dispose();
            }
            const recentlyOpenedList = this.recentlyOpenedList = new GettingStartedIndexList((0, nls_1.localize)(7, null), 'recently-opened', 5, (0, dom_1.$)('.empty-recent', {}, 'You have no recent folders,', (0, dom_1.$)('button.button-link', { 'x-dispatch': 'openFolder' }, 'open a folder'), 'to start.'), (0, dom_1.$)('.more', {}, (0, dom_1.$)('button.button-link', {
                'x-dispatch': 'showMoreRecents',
                title: (0, nls_1.localize)(8, null, this.getKeybindingLabel('workbench.action.openRecent'))
            }, 'More...')), renderRecent);
            recentlyOpenedList.onDidChange(() => this.registerDispatchListeners());
            this.recentlyOpened.then(({ workspaces }) => {
                // Filter out the current workspace
                workspaces = workspaces.filter(recent => !this.workspaceContextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri));
                const updateEntries = () => { recentlyOpenedList.setEntries(workspaces); };
                updateEntries();
                recentlyOpenedList.register(this.labelService.onDidChangeFormatters(() => updateEntries()));
            }).catch(errors_1.onUnexpectedError);
            return recentlyOpenedList;
        }
        buildStartList() {
            const renderStartEntry = (entry) => entry.content.type === 'steps'
                ? undefined
                : (0, dom_1.$)('li', {}, (0, dom_1.$)('button.button-link', {
                    'x-dispatch': 'selectCategory:' + entry.id,
                    title: entry.description + this.getKeybindingLabel(entry.content.command),
                }, this.iconWidgetFor(entry), (0, dom_1.$)('span', {}, entry.title)));
            if (this.startList) {
                this.startList.dispose();
            }
            const startList = this.startList = new GettingStartedIndexList((0, nls_1.localize)(9, null), 'start-container', 10, undefined, undefined, renderStartEntry);
            startList.setEntries(this.gettingStartedCategories);
            startList.onDidChange(() => this.registerDispatchListeners());
            return startList;
        }
        buildGettingStartedWalkthroughsList() {
            const renderGetttingStaredWalkthrough = (category) => {
                const hiddenCategories = this.getHiddenCategories();
                if (category.content.type !== 'steps' || hiddenCategories.has(category.id)) {
                    return undefined;
                }
                return (0, dom_1.$)('button.getting-started-category', {
                    'x-dispatch': 'selectCategory:' + category.id,
                    'role': 'listitem',
                    'title': category.description
                }, this.iconWidgetFor(category), (0, dom_1.$)('a.codicon.codicon-close.hide-category-button', {
                    'x-dispatch': 'hideCategory:' + category.id,
                    'title': (0, nls_1.localize)(10, null),
                }), (0, dom_1.$)('h3.category-title.max-lines-3', { 'x-category-title-for': category.id }, category.title), (0, dom_1.$)('.category-progress', { 'x-data-category-id': category.id, }, (0, dom_1.$)('.progress-bar-outer', { 'role': 'progressbar' }, (0, dom_1.$)('.progress-bar-inner'))));
            };
            if (this.gettingStartedList) {
                this.gettingStartedList.dispose();
            }
            const gettingStartedList = this.gettingStartedList = new GettingStartedIndexList((0, nls_1.localize)(11, null), 'getting-started', 10, undefined, undefined, renderGetttingStaredWalkthrough);
            gettingStartedList.onDidChange(() => {
                this.registerDispatchListeners();
                this.updateCategoryProgress();
            });
            gettingStartedList.setEntries(this.gettingStartedCategories);
            return gettingStartedList;
        }
        layout(size) {
            var _a, _b, _c, _d, _e, _f;
            (_a = this.detailsScrollbar) === null || _a === void 0 ? void 0 : _a.scanDomNode();
            (_b = this.categoriesPageScrollbar) === null || _b === void 0 ? void 0 : _b.scanDomNode();
            (_c = this.detailsPageScrollbar) === null || _c === void 0 ? void 0 : _c.scanDomNode();
            (_d = this.startList) === null || _d === void 0 ? void 0 : _d.layout(size);
            (_e = this.gettingStartedList) === null || _e === void 0 ? void 0 : _e.layout(size);
            (_f = this.recentlyOpenedList) === null || _f === void 0 ? void 0 : _f.layout(size);
            this.container.classList[size.height <= 600 ? 'add' : 'remove']('height-constrained');
            this.container.classList[size.width <= 400 ? 'add' : 'remove']('width-constrained');
            this.container.classList[size.width <= 800 ? 'add' : 'remove']('width-semi-constrained');
            if (this.selectedStepElement) {
                this.selectedStepElement.style.height = ``; // unset or the scrollHeight will just be the old height
                this.selectedStepElement.style.height = `${this.selectedStepElement.scrollHeight}px`;
            }
        }
        updateCategoryProgress() {
            document.querySelectorAll('.category-progress').forEach(element => {
                const categoryID = element.getAttribute('x-data-category-id');
                const category = this.gettingStartedCategories.find(category => category.id === categoryID);
                if (!category) {
                    throw Error('Could not find category with ID ' + categoryID);
                }
                if (category.content.type !== 'steps') {
                    throw Error('Category with ID ' + categoryID + ' is not of steps type');
                }
                const numDone = category.content.stepsComplete = category.content.steps.filter(step => step.done).length;
                const numTotal = category.content.stepsTotal = category.content.steps.length;
                const bar = (0, types_1.assertIsDefined)(element.querySelector('.progress-bar-inner'));
                bar.setAttribute('aria-valuemin', '0');
                bar.setAttribute('aria-valuenow', '' + numDone);
                bar.setAttribute('aria-valuemax', '' + numTotal);
                const progress = Math.max((numDone / numTotal) * 100, 3);
                bar.style.width = `${progress}%`;
                if (numTotal === numDone) {
                    bar.title = `All steps complete!`;
                }
                else {
                    bar.title = `${numDone} of ${numTotal} steps complete`;
                }
            });
        }
        async scrollToCategory(categoryID) {
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                (0, dom_1.reset)(this.stepsContent);
                this.editorInput.selectedCategory = categoryID;
                this.currentCategory = this.gettingStartedCategories.find(category => category.id === categoryID);
                this.buildCategorySlide(categoryID);
                this.setSlide('details');
            });
        }
        iconWidgetFor(category) {
            return category.icon.type === 'icon' ? (0, dom_1.$)(themeService_1.ThemeIcon.asCSSSelector(category.icon.icon)) : (0, dom_1.$)('img.category-icon', { src: category.icon.path });
        }
        buildStepMarkdownDescription(container, text) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            for (const linkedText of text) {
                if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                    const node = linkedText.nodes[0];
                    const buttonContainer = (0, dom_1.append)(container, (0, dom_1.$)('.button-container'));
                    const button = new button_1.Button(buttonContainer, { title: node.title, supportIcons: true });
                    const isCommand = node.href.startsWith('command:');
                    const toSide = node.href.startsWith('command:toSide:');
                    const command = node.href.replace(/command:(toSide:)?/, 'command:');
                    button.label = node.label;
                    button.onDidClick(async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.telemetryService.publicLog2('gettingStarted.ActionExecuted', { command: 'runStepAction', argument: node.href });
                        const fullSize = this.groupsService.contentDimension;
                        if (toSide && fullSize.width > 700) {
                            if (this.groupsService.count === 1) {
                                this.groupsService.addGroup(this.groupsService.groups[0], 2 /* LEFT */, { activate: true });
                                let gettingStartedSize;
                                if (fullSize.width > 1600) {
                                    gettingStartedSize = 800;
                                }
                                else if (fullSize.width > 800) {
                                    gettingStartedSize = 400;
                                }
                                else {
                                    gettingStartedSize = 350;
                                }
                                const gettingStartedGroup = this.groupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).find(group => (group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                                this.groupsService.setSize((0, types_1.assertIsDefined)(gettingStartedGroup), { width: gettingStartedSize, height: fullSize.height });
                            }
                            const nonGettingStartedGroup = this.groupsService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).find(group => !(group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput));
                            if (nonGettingStartedGroup) {
                                this.groupsService.activateGroup(nonGettingStartedGroup);
                                nonGettingStartedGroup.focus();
                            }
                        }
                        this.openerService.open(command, { allowCommands: true });
                    }, null, this.detailsPageDisposables);
                    if (isCommand) {
                        const keybindingLabel = this.getKeybindingLabel(command);
                        if (keybindingLabel) {
                            container.appendChild((0, dom_1.$)('span.shortcut-message', {}, 'Tip: Use keyboard shortcut ', (0, dom_1.$)('span.keybinding', {}, keybindingLabel)));
                        }
                    }
                    this.detailsPageDisposables.add(button);
                    this.detailsPageDisposables.add((0, styler_1.attachButtonStyler)(button, this.themeService));
                }
                else {
                    const p = (0, dom_1.append)(container, (0, dom_1.$)('p'));
                    for (const node of linkedText.nodes) {
                        if (typeof node === 'string') {
                            (0, dom_1.append)(p, (0, formattedTextRenderer_1.renderFormattedText)(node, { inline: true, renderCodeSegements: true }));
                        }
                        else {
                            const link = this.instantiationService.createInstance(link_1.Link, node);
                            (0, dom_1.append)(p, link.el);
                            this.detailsPageDisposables.add(link);
                            this.detailsPageDisposables.add((0, styler_1.attachLinkStyler)(link, this.themeService));
                        }
                    }
                }
            }
            return container;
        }
        clearInput() {
            this.stepDisposables.clear();
            super.clearInput();
        }
        buildCategorySlide(categoryID, selectedStep) {
            var _a, _b;
            if (this.detailsScrollbar) {
                this.detailsScrollbar.dispose();
            }
            this.detailsPageDisposables.clear();
            const category = this.gettingStartedCategories.find(category => category.id === categoryID);
            if (!category) {
                throw Error('could not find category with ID ' + categoryID);
            }
            if (category.content.type !== 'steps') {
                throw Error('category with ID ' + categoryID + ' is not of steps type');
            }
            const categoryDescriptorComponent = (0, dom_1.$)('.getting-started-category', {}, this.iconWidgetFor(category), (0, dom_1.$)('.category-description-container', {}, (0, dom_1.$)('h2.category-title.max-lines-3', { 'x-category-title-for': category.id }, category.title), (0, dom_1.$)('.category-description.description.max-lines-3', { 'x-category-description-for': category.id }, category.description)));
            const categoryElements = category.content.steps.map((step, i, arr) => {
                const codicon = (0, dom_1.$)('.codicon' + (step.done ? '.complete' + themeService_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedCheckedCodicon) : themeService_1.ThemeIcon.asCSSSelector(gettingStartedIcons_1.gettingStartedUncheckedCodicon)), {
                    'data-done-step-id': step.id,
                    'x-dispatch': 'toggleStepCompletion:' + step.id,
                });
                const container = (0, dom_1.$)('.step-description-container', { 'x-step-description-for': step.id });
                this.buildStepMarkdownDescription(container, step.description);
                const stepDescription = (0, dom_1.$)('.step-container', {}, (0, dom_1.$)('h3.step-title.max-lines-3', { 'x-step-title-for': step.id }, step.title), container);
                if (step.media.type === 'image') {
                    stepDescription.appendChild((0, dom_1.$)('.image-description', { 'aria-label': (0, nls_1.localize)(12, null, step.media.altText) }));
                }
                return (0, dom_1.$)('button.getting-started-step', {
                    'x-dispatch': 'selectTask:' + step.id,
                    'data-step-id': step.id,
                    'aria-expanded': 'false',
                    'aria-checked': '' + step.done,
                    'role': 'listitem',
                }, codicon, stepDescription);
            });
            const stepsContainer = (0, dom_1.$)('.getting-started-detail-container', { 'role': 'list' }, ...categoryElements);
            this.detailsScrollbar = this._register(new scrollableElement_1.DomScrollableElement(stepsContainer, { className: 'steps-container' }));
            const stepListComponent = this.detailsScrollbar.getDomNode();
            (0, dom_1.reset)(this.stepsContent, categoryDescriptorComponent, stepListComponent, this.stepMediaComponent);
            const toExpand = (_a = category.content.steps.find(step => !step.done)) !== null && _a !== void 0 ? _a : category.content.steps[0];
            this.selectStep(selectedStep !== null && selectedStep !== void 0 ? selectedStep : toExpand.id, false);
            this.detailsScrollbar.scanDomNode();
            (_b = this.detailsPageScrollbar) === null || _b === void 0 ? void 0 : _b.scanDomNode();
            this.registerDispatchListeners();
        }
        getKeybindingLabel(command) {
            var _a;
            command = command.replace(/^command:/, '');
            const label = (_a = this.keybindingService.lookupKeybinding(command)) === null || _a === void 0 ? void 0 : _a.getLabel();
            if (!label) {
                return '';
            }
            else {
                return `(${label})`;
            }
        }
        async scrollPrev() {
            this.inProgressScroll = this.inProgressScroll.then(async () => {
                this.currentCategory = undefined;
                this.editorInput.selectedCategory = undefined;
                this.editorInput.selectedStep = undefined;
                this.selectStep(undefined);
                this.setSlide('categories');
            });
        }
        runSkip() {
            this.commandService.executeCommand('workbench.action.closeActiveEditor');
        }
        escape() {
            if (this.editorInput.selectedCategory) {
                this.scrollPrev();
            }
            else {
                this.runSkip();
            }
        }
        focusNext() {
            var _a, _b, _c, _d, _e, _f, _g;
            if (this.editorInput.selectedCategory) {
                const allSteps = ((_a = this.currentCategory) === null || _a === void 0 ? void 0 : _a.content.type) === 'steps' && this.currentCategory.content.steps;
                if (allSteps) {
                    const toFind = (_b = this.editorInput.selectedStep) !== null && _b !== void 0 ? _b : this.previousSelection;
                    const selectedIndex = allSteps.findIndex(step => step.id === toFind);
                    if ((_c = allSteps[selectedIndex + 1]) === null || _c === void 0 ? void 0 : _c.id) {
                        this.selectStep((_d = allSteps[selectedIndex + 1]) === null || _d === void 0 ? void 0 : _d.id, true, false);
                    }
                }
            }
            else {
                (_g = (_f = (_e = document.activeElement) === null || _e === void 0 ? void 0 : _e.nextElementSibling) === null || _f === void 0 ? void 0 : _f.focus) === null || _g === void 0 ? void 0 : _g.call(_f);
            }
        }
        focusPrevious() {
            var _a, _b, _c, _d, _e, _f, _g;
            if (this.editorInput.selectedCategory) {
                const allSteps = ((_a = this.currentCategory) === null || _a === void 0 ? void 0 : _a.content.type) === 'steps' && this.currentCategory.content.steps;
                if (allSteps) {
                    const toFind = (_b = this.editorInput.selectedStep) !== null && _b !== void 0 ? _b : this.previousSelection;
                    const selectedIndex = allSteps.findIndex(step => step.id === toFind);
                    if ((_c = allSteps[selectedIndex - 1]) === null || _c === void 0 ? void 0 : _c.id) {
                        this.selectStep((_d = allSteps[selectedIndex - 1]) === null || _d === void 0 ? void 0 : _d.id, true, false);
                    }
                }
            }
            else {
                (_g = (_f = (_e = document.activeElement) === null || _e === void 0 ? void 0 : _e.previousElementSibling) === null || _f === void 0 ? void 0 : _f.focus) === null || _g === void 0 ? void 0 : _g.call(_f);
            }
        }
        setSlide(toEnable) {
            const slideManager = (0, types_1.assertIsDefined)(this.container.querySelector('.gettingStarted'));
            if (toEnable === 'categories') {
                slideManager.classList.remove('showDetails');
                slideManager.classList.add('showCategories');
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = false);
                this.container.focus();
            }
            else {
                slideManager.classList.add('showDetails');
                slideManager.classList.remove('showCategories');
                this.container.querySelector('.gettingStartedSlideDetails').querySelectorAll('button').forEach(button => button.disabled = false);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('button').forEach(button => button.disabled = true);
                this.container.querySelector('.gettingStartedSlideCategories').querySelectorAll('input').forEach(button => button.disabled = true);
            }
        }
    };
    GettingStartedPage.ID = 'gettingStartedPage';
    GettingStartedPage = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, productService_1.IProductService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, gettingStartedService_1.IGettingStartedService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, modeService_1.IModeService),
        __param(7, files_1.IFileService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, storage_1.IStorageService),
        __param(11, extensions_1.IExtensionService),
        __param(12, instantiation_1.IInstantiationService),
        __param(13, environmentService_1.IWorkbenchEnvironmentService),
        __param(14, editorGroupsService_1.IEditorGroupsService),
        __param(15, contextkey_1.IContextKeyService),
        __param(16, quickInput_1.IQuickInputService),
        __param(17, workspaces_1.IWorkspacesService),
        __param(18, label_1.ILabelService),
        __param(19, host_1.IHostService),
        __param(20, webview_1.IWebviewService),
        __param(21, workspace_1.IWorkspaceContextService),
        __param(22, (0, instantiation_1.optional)(experimentService_1.ITASExperimentService))
    ], GettingStartedPage);
    exports.GettingStartedPage = GettingStartedPage;
    class GettingStartedInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return JSON.stringify({ selectedCategory: editorInput.selectedCategory, selectedStep: editorInput.selectedStep });
        }
        deserialize(instantiationService, serializedEditorInput) {
            try {
                const { selectedCategory, selectedStep } = JSON.parse(serializedEditorInput);
                return new gettingStartedInput_1.GettingStartedInput({ selectedCategory, selectedStep });
            }
            catch (_a) { }
            return new gettingStartedInput_1.GettingStartedInput({});
        }
    }
    exports.GettingStartedInputSerializer = GettingStartedInputSerializer;
    class GettingStartedIndexList extends lifecycle_1.Disposable {
        constructor(title, klass, limit, empty, more, renderElement) {
            super();
            this.limit = limit;
            this.empty = empty;
            this.more = more;
            this.renderElement = renderElement;
            this._onDidChangeEntries = new event_1.Emitter();
            this.onDidChangeEntries = this._onDidChangeEntries.event;
            this.entries = [];
            this.itemCount = 0;
            this.list = (0, dom_1.$)('ul');
            this.scrollbar = this._register(new scrollableElement_1.DomScrollableElement(this.list, {}));
            this._register(this.onDidChangeEntries(() => this.scrollbar.scanDomNode()));
            this.domElement = (0, dom_1.$)('.index-list.' + klass, {}, (0, dom_1.$)('h2', {}, title), this.scrollbar.getDomNode());
        }
        getDomElement() {
            return this.domElement;
        }
        layout(size) {
            this.scrollbar.scanDomNode();
        }
        onDidChange(listener) {
            this._register(this.onDidChangeEntries(listener));
        }
        register(d) { this._register(d); }
        setLimit(limit) {
            this.limit = limit;
            this.setEntries(this.entries);
        }
        rerender() {
            this.setEntries(this.entries);
        }
        setEntries(entries) {
            this.itemCount = 0;
            this.entries = entries;
            while (this.list.firstChild) {
                this.list.removeChild(this.list.firstChild);
            }
            for (const entry of entries) {
                const rendered = this.renderElement(entry);
                if (!rendered) {
                    continue;
                }
                this.itemCount++;
                if (this.itemCount > this.limit) {
                    if (this.more) {
                        this.list.appendChild(this.more);
                    }
                    break;
                }
                else {
                    this.list.appendChild(rendered);
                }
            }
            if (this.itemCount === 0 && this.empty) {
                this.list.appendChild(this.empty);
            }
            this._onDidChangeEntries.fire();
        }
    }
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const backgroundColor = theme.getColor(welcomePageColors_1.welcomePageBackground);
        if (backgroundColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer { background-color: ${backgroundColor}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer { color: ${foregroundColor}; }`);
        }
        const descriptionColor = theme.getColor(colorRegistry_1.descriptionForeground);
        if (descriptionColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .description { color: ${descriptionColor}; }`);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .category-progress .message { color: ${descriptionColor}; }`);
        }
        const iconColor = theme.getColor(colorRegistry_1.textLinkForeground);
        if (iconColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .getting-started-category .codicon:not(.codicon-close) { color: ${iconColor} }`);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideDetails .getting-started-step .codicon.complete { color: ${iconColor} } `);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideDetails .getting-started-step.expanded .codicon { color: ${iconColor} } `);
        }
        const buttonColor = theme.getColor(welcomePageColors_1.welcomePageTileBackground);
        if (buttonColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button { background: ${buttonColor}; }`);
        }
        const shadowColor = theme.getColor(welcomePageColors_1.welcomePageTileShadow);
        if (shadowColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideCategories .getting-started-category { filter: drop-shadow(2px 2px 2px ${buttonColor}); }`);
        }
        const buttonHoverColor = theme.getColor(welcomePageColors_1.welcomePageTileHoverBackground);
        if (buttonHoverColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button:hover { background: ${buttonHoverColor}; }`);
        }
        if (buttonColor && buttonHoverColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button.expanded:hover { background: ${buttonColor}; }`);
        }
        const emphasisButtonForeground = theme.getColor(colorRegistry_1.buttonForeground);
        if (emphasisButtonForeground) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button.emphasis { color: ${emphasisButtonForeground}; }`);
        }
        const emphasisButtonBackground = theme.getColor(colorRegistry_1.buttonBackground);
        if (emphasisButtonBackground) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button.emphasis { background: ${emphasisButtonBackground}; }`);
        }
        const pendingStepColor = theme.getColor(colorRegistry_1.descriptionForeground);
        if (pendingStepColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideDetails .getting-started-step .codicon { color: ${pendingStepColor} } `);
        }
        const emphasisButtonHoverBackground = theme.getColor(colorRegistry_1.buttonHoverBackground);
        if (emphasisButtonHoverBackground) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button.emphasis:hover { background: ${emphasisButtonHoverBackground}; }`);
        }
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer a:not(.codicon-close) { color: ${link}; }`);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .button-link { color: ${link}; }`);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .button-link .scroll-button { color: ${link}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer a:not(.codicon-close):hover,
			.monaco-workbench .part.editor > .content .gettingStartedContainer a:active { color: ${activeLink}; }`);
        }
        const focusColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer a:not(.codicon-close):focus { outline-color: ${focusColor}; }`);
        }
        const border = theme.getColor(colorRegistry_1.contrastBorder);
        if (border) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button { border: 1px solid ${border}; }`);
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button.button-link { border: inherit; }`);
        }
        const activeBorder = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeBorder) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer button:hover { outline-color: ${activeBorder}; }`);
        }
        const progressBackground = theme.getColor(welcomePageColors_1.welcomePageProgressBackground);
        if (progressBackground) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideCategories .progress-bar-outer { background-color: ${progressBackground}; }`);
        }
        const progressForeground = theme.getColor(welcomePageColors_1.welcomePageProgressForeground);
        if (progressForeground) {
            collector.addRule(`.monaco-workbench .part.editor > .content .gettingStartedContainer .gettingStartedSlideCategories .progress-bar-inner { background-color: ${progressForeground}; }`);
        }
    });
});
//# sourceMappingURL=gettingStarted.js.map