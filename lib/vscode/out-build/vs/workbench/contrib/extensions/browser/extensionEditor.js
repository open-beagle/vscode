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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionEditor", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/cache", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/browser/event", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/base/common/color", "vs/platform/notification/common/notification", "vs/base/common/cancellation", "vs/workbench/contrib/extensions/browser/extensionsViewer", "vs/workbench/contrib/update/common/update", "vs/base/common/keybindingParser", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/types", "vs/workbench/services/themes/common/workbenchThemeService", "vs/workbench/contrib/webview/browser/webview", "vs/base/browser/keyboardEvent", "vs/base/common/uuid", "vs/base/common/process", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/contrib/markdown/common/markdownDocumentRenderer", "vs/editor/common/services/modeService", "vs/editor/common/modes", "vs/editor/common/modes/supports/tokenization", "vs/platform/theme/common/colorRegistry", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/base/browser/markdownRenderer", "vs/platform/theme/common/styler", "vs/css!./media/extensionEditor"], function (require, exports, nls_1, async_1, arrays, platform_1, event_1, cache_1, actions_1, errors_1, lifecycle_1, event_2, dom_1, editorPane_1, viewlet_1, telemetry_1, instantiation_1, extensionRecommendations_1, extensions_1, extensionsWidgets_1, actionbar_1, extensionsActions_1, keybinding_1, scrollableElement_1, opener_1, themeService_1, keybindingLabel_1, contextkey_1, editorService_1, color_1, notification_1, cancellation_1, extensionsViewer_1, update_1, keybindingParser_1, storage_1, extensions_2, configurationRegistry_1, types_1, workbenchThemeService_1, webview_1, keyboardEvent_1, uuid_1, process_1, uri_1, network_1, markdownDocumentRenderer_1, modeService_1, modes_1, tokenization_1, colorRegistry_1, actions_2, contextView_1, editorContextKeys_1, extensionsList_1, markdownRenderer_1, styler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEditor = void 0;
    class NavBar extends lifecycle_1.Disposable {
        constructor(container) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this._currentId = null;
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.navbar'));
            this.actions = [];
            this.actionbar = this._register(new actionbar_1.ActionBar(element, { animated: false }));
        }
        get onChange() { return this._onChange.event; }
        get currentId() { return this._currentId; }
        push(id, label, tooltip) {
            const action = new actions_1.Action(id, label, undefined, true, () => this._update(id, true));
            action.tooltip = tooltip;
            this.actions.push(action);
            this.actionbar.push(action);
            if (this.actions.length === 1) {
                this._update(id);
            }
        }
        clear() {
            this.actions = (0, lifecycle_1.dispose)(this.actions);
            this.actionbar.clear();
        }
        update() {
            this._update(this._currentId);
        }
        _update(id = this._currentId, focus) {
            this._currentId = id;
            this._onChange.fire({ id, focus: !!focus });
            this.actions.forEach(a => a.checked = a.id === id);
            return Promise.resolve(undefined);
        }
    }
    const NavbarSection = {
        Readme: 'readme',
        Contributions: 'contributions',
        Changelog: 'changelog',
        Dependencies: 'dependencies',
        ExtensionPack: 'extensionPack',
    };
    var WebviewIndex;
    (function (WebviewIndex) {
        WebviewIndex[WebviewIndex["Readme"] = 0] = "Readme";
        WebviewIndex[WebviewIndex["Changelog"] = 1] = "Changelog";
    })(WebviewIndex || (WebviewIndex = {}));
    let ExtensionEditor = class ExtensionEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, instantiationService, viewletService, extensionsWorkbenchService, themeService, keybindingService, notificationService, openerService, extensionRecommendationsService, extensionIgnoredRecommendationsService, storageService, extensionService, workbenchThemeService, webviewService, modeService, contextMenuService) {
            super(ExtensionEditor.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.viewletService = viewletService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this.extensionService = extensionService;
            this.workbenchThemeService = workbenchThemeService;
            this.webviewService = webviewService;
            this.modeService = modeService;
            this.contextMenuService = contextMenuService;
            // Some action bar items use a webview whose vertical scroll position we track in this map
            this.initialScrollProgress = new Map();
            // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
            this.currentIdentifier = '';
            this.layoutParticipants = [];
            this.contentDisposables = this._register(new lifecycle_1.DisposableStore());
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.keybindingLabelStylers = this.contentDisposables.add(new lifecycle_1.DisposableStore());
            this.activeElement = null;
            this.editorLoadComplete = false;
            this.extensionReadme = null;
            this.extensionChangelog = null;
            this.extensionManifest = null;
        }
        createEditor(parent) {
            const root = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-editor'));
            root.tabIndex = 0; // this is required for the focus tracker on the editor
            root.style.outline = 'none';
            root.setAttribute('role', 'document');
            const header = (0, dom_1.append)(root, (0, dom_1.$)('.header'));
            const iconContainer = (0, dom_1.append)(header, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon', { draggable: false }));
            const details = (0, dom_1.append)(header, (0, dom_1.$)('.details'));
            const title = (0, dom_1.append)(details, (0, dom_1.$)('.title'));
            const name = (0, dom_1.append)(title, (0, dom_1.$)('span.name.clickable', { title: (0, nls_1.localize)(0, null), role: 'heading', tabIndex: 0 }));
            const identifier = (0, dom_1.append)(title, (0, dom_1.$)('span.identifier', { title: (0, nls_1.localize)(1, null) }));
            const preview = (0, dom_1.append)(title, (0, dom_1.$)('span.preview', { title: (0, nls_1.localize)(2, null) }));
            preview.textContent = (0, nls_1.localize)(3, null);
            const builtin = (0, dom_1.append)(title, (0, dom_1.$)('span.builtin'));
            builtin.textContent = (0, nls_1.localize)(4, null);
            const subtitle = (0, dom_1.append)(details, (0, dom_1.$)('.subtitle'));
            const publisher = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.publisher.clickable', { title: (0, nls_1.localize)(5, null), tabIndex: 0 }));
            const installCount = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.install', { title: (0, nls_1.localize)(6, null), tabIndex: 0 }));
            const rating = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.rating.clickable', { title: (0, nls_1.localize)(7, null), tabIndex: 0 }));
            const repository = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.repository.clickable'));
            repository.textContent = (0, nls_1.localize)(8, null);
            repository.style.display = 'none';
            repository.tabIndex = 0;
            const license = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.license.clickable'));
            license.textContent = (0, nls_1.localize)(9, null);
            license.style.display = 'none';
            license.tabIndex = 0;
            const version = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.version'));
            version.textContent = (0, nls_1.localize)(10, null);
            const description = (0, dom_1.append)(details, (0, dom_1.$)('.description'));
            const extensionActions = (0, dom_1.append)(details, (0, dom_1.$)('.actions'));
            const extensionActionBar = this._register(new actionbar_1.ActionBar(extensionActions, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.ExtensionDropDownAction) {
                        return action.createActionViewItem();
                    }
                    if (action instanceof extensionsActions_1.ActionWithDropDownAction) {
                        return new extensionsActions_1.ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            }));
            const subtextContainer = (0, dom_1.append)(details, (0, dom_1.$)('.subtext-container'));
            const subtext = (0, dom_1.append)(subtextContainer, (0, dom_1.$)('.subtext'));
            const ignoreActionbar = this._register(new actionbar_1.ActionBar(subtextContainer, { animated: false }));
            this._register(event_1.Event.chain(extensionActionBar.onDidRun)
                .map(({ error }) => error)
                .filter(error => !!error)
                .on(this.onError, this));
            this._register(event_1.Event.chain(ignoreActionbar.onDidRun)
                .map(({ error }) => error)
                .filter(error => !!error)
                .on(this.onError, this));
            const body = (0, dom_1.append)(root, (0, dom_1.$)('.body'));
            const navbar = new NavBar(body);
            const content = (0, dom_1.append)(body, (0, dom_1.$)('.content'));
            content.id = (0, uuid_1.generateUuid)(); // An id is needed for the webview parent flow to
            this.template = {
                builtin,
                content,
                description,
                extensionActionBar,
                header,
                icon,
                iconContainer,
                identifier,
                version,
                ignoreActionbar,
                installCount,
                license,
                name,
                navbar,
                preview,
                publisher,
                rating,
                repository,
                subtext,
                subtextContainer
            };
        }
        onClick(element, callback) {
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, (0, dom_1.finalHandler)(callback)));
            disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.KEY_UP, e => {
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (keyboardEvent.equals(10 /* Space */) || keyboardEvent.equals(3 /* Enter */)) {
                    e.preventDefault();
                    e.stopPropagation();
                    callback();
                }
            }));
            return disposables;
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            if (this.template) {
                await this.updateTemplate(input, this.template, !!(options === null || options === void 0 ? void 0 : options.preserveFocus));
            }
        }
        async updateTemplate(input, template, preserveFocus) {
            var _a;
            this.activeElement = null;
            this.editorLoadComplete = false;
            const extension = input.extension;
            if (this.currentIdentifier !== extension.identifier.id) {
                this.initialScrollProgress.clear();
                this.currentIdentifier = extension.identifier.id;
            }
            this.transientDisposables.clear();
            this.extensionReadme = new cache_1.Cache(() => (0, async_1.createCancelablePromise)(token => extension.getReadme(token)));
            this.extensionChangelog = new cache_1.Cache(() => (0, async_1.createCancelablePromise)(token => extension.getChangelog(token)));
            this.extensionManifest = new cache_1.Cache(() => (0, async_1.createCancelablePromise)(token => extension.getManifest(token)));
            const remoteBadge = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, template.iconContainer, true);
            const onError = event_1.Event.once((0, event_2.domEvent)(template.icon, 'error'));
            onError(() => template.icon.src = extension.iconUrlFallback, null, this.transientDisposables);
            template.icon.src = extension.iconUrl;
            template.name.textContent = extension.displayName;
            template.identifier.textContent = extension.identifier.id;
            template.preview.style.display = extension.preview ? 'inherit' : 'none';
            template.builtin.style.display = extension.isBuiltin ? 'inherit' : 'none';
            template.publisher.textContent = extension.publisherDisplayName;
            template.version.textContent = `v${extension.version}`;
            template.description.textContent = extension.description;
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            let recommendationsData = {};
            if (extRecommendations[extension.identifier.id.toLowerCase()]) {
                recommendationsData = { recommendationReason: extRecommendations[extension.identifier.id.toLowerCase()].reasonId };
            }
            /* __GDPR__
            "extensionGallery:openExtension" : {
                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
            */
            this.telemetryService.publicLog('extensionGallery:openExtension', Object.assign(Object.assign({}, extension.telemetryData), recommendationsData));
            template.name.classList.toggle('clickable', !!extension.url);
            template.publisher.classList.toggle('clickable', !!extension.url);
            template.rating.classList.toggle('clickable', !!extension.url);
            if (extension.url) {
                this.transientDisposables.add(this.onClick(template.name, () => this.openerService.open(uri_1.URI.parse(extension.url))));
                this.transientDisposables.add(this.onClick(template.rating, () => this.openerService.open(uri_1.URI.parse(`${extension.url}#review-details`))));
                this.transientDisposables.add(this.onClick(template.publisher, () => {
                    this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                        .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
                        .then(viewlet => viewlet.search(`publisher:"${extension.publisherDisplayName}"`));
                }));
                if (extension.licenseUrl) {
                    this.transientDisposables.add(this.onClick(template.license, () => this.openerService.open(uri_1.URI.parse(extension.licenseUrl))));
                    template.license.style.display = 'initial';
                }
                else {
                    template.license.style.display = 'none';
                }
            }
            else {
                template.license.style.display = 'none';
            }
            if (extension.repository) {
                this.transientDisposables.add(this.onClick(template.repository, () => this.openerService.open(uri_1.URI.parse(extension.repository))));
                template.repository.style.display = 'initial';
            }
            else {
                template.repository.style.display = 'none';
            }
            const widgets = [
                remoteBadge,
                this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, template.installCount, false),
                this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, template.rating, false)
            ];
            const reloadAction = this.instantiationService.createInstance(extensionsActions_1.ReloadAction);
            const combinedInstallAction = this.instantiationService.createInstance(extensionsActions_1.InstallDropdownAction);
            const systemDisabledWarningAction = this.instantiationService.createInstance(extensionsActions_1.SystemDisabledWarningAction);
            const actions = [
                reloadAction,
                this.instantiationService.createInstance(extensionsActions_1.StatusLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.UpdateAction),
                this.instantiationService.createInstance(extensionsActions_1.SetColorThemeAction, await this.workbenchThemeService.getColorThemes()),
                this.instantiationService.createInstance(extensionsActions_1.SetFileIconThemeAction, await this.workbenchThemeService.getFileIconThemes()),
                this.instantiationService.createInstance(extensionsActions_1.SetProductIconThemeAction, await this.workbenchThemeService.getProductIconThemes()),
                this.instantiationService.createInstance(extensionsActions_1.EnableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.DisableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.RemoteInstallAction, false),
                this.instantiationService.createInstance(extensionsActions_1.LocalInstallAction),
                this.instantiationService.createInstance(extensionsActions_1.WebInstallAction),
                combinedInstallAction,
                this.instantiationService.createInstance(extensionsActions_1.InstallingLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.uninstall', extensionsActions_1.UninstallAction.UninstallLabel, [
                    this.instantiationService.createInstance(extensionsActions_1.UninstallAction),
                    this.instantiationService.createInstance(extensionsActions_1.InstallAnotherVersionAction),
                ]),
                this.instantiationService.createInstance(extensionsActions_1.ToggleSyncExtensionAction),
                this.instantiationService.createInstance(extensionsActions_1.ExtensionEditorManageExtensionAction),
                systemDisabledWarningAction,
                this.instantiationService.createInstance(extensionsActions_1.ExtensionToolTipAction, systemDisabledWarningAction, reloadAction),
                this.instantiationService.createInstance(extensionsActions_1.MaliciousStatusLabelAction, true),
            ];
            const extensionContainers = this.instantiationService.createInstance(extensions_1.ExtensionContainers, [...actions, ...widgets]);
            extensionContainers.extension = extension;
            template.extensionActionBar.clear();
            template.extensionActionBar.push(actions, { icon: true, label: true });
            template.extensionActionBar.setFocusable(true);
            for (const disposable of [...actions, ...widgets, extensionContainers]) {
                this.transientDisposables.add(disposable);
            }
            this.setSubText(extension, template);
            template.content.innerText = ''; // Clear content before setting navbar actions.
            template.navbar.clear();
            if (extension.hasReadme()) {
                template.navbar.push(NavbarSection.Readme, (0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null));
            }
            const manifest = await this.extensionManifest.get().promise;
            if (manifest) {
                combinedInstallAction.manifest = manifest;
            }
            if (manifest && manifest.contributes) {
                template.navbar.push(NavbarSection.Contributions, (0, nls_1.localize)(13, null), (0, nls_1.localize)(14, null));
            }
            if (extension.hasChangelog()) {
                template.navbar.push(NavbarSection.Changelog, (0, nls_1.localize)(15, null), (0, nls_1.localize)(16, null));
            }
            if (extension.dependencies.length) {
                template.navbar.push(NavbarSection.Dependencies, (0, nls_1.localize)(17, null), (0, nls_1.localize)(18, null));
            }
            if (manifest && ((_a = manifest.extensionPack) === null || _a === void 0 ? void 0 : _a.length) && !this.shallRenderAsExensionPack(manifest)) {
                template.navbar.push(NavbarSection.ExtensionPack, (0, nls_1.localize)(19, null), (0, nls_1.localize)(20, null));
            }
            if (template.navbar.currentId) {
                this.onNavbarChange(extension, { id: template.navbar.currentId, focus: !preserveFocus }, template);
            }
            template.navbar.onChange(e => this.onNavbarChange(extension, e, template), this, this.transientDisposables);
            this.editorLoadComplete = true;
        }
        setSubText(extension, template) {
            (0, dom_1.hide)(template.subtextContainer);
            const updateRecommendationFn = () => {
                const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
                if (extRecommendations[extension.identifier.id.toLowerCase()]) {
                    template.subtext.textContent = extRecommendations[extension.identifier.id.toLowerCase()].reasonText;
                    (0, dom_1.show)(template.subtextContainer);
                }
                else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(extension.identifier.id.toLowerCase()) !== -1) {
                    template.subtext.textContent = (0, nls_1.localize)(21, null);
                    (0, dom_1.show)(template.subtextContainer);
                }
                else {
                    template.subtext.textContent = '';
                    (0, dom_1.hide)(template.subtextContainer);
                }
            };
            updateRecommendationFn();
            this.transientDisposables.add(this.extensionRecommendationsService.onDidChangeRecommendations(() => updateRecommendationFn()));
        }
        clearInput() {
            this.contentDisposables.clear();
            this.transientDisposables.clear();
            super.clearInput();
        }
        focus() {
            var _a;
            (_a = this.activeElement) === null || _a === void 0 ? void 0 : _a.focus();
        }
        showFind() {
            var _a;
            (_a = this.activeWebview) === null || _a === void 0 ? void 0 : _a.showFind();
        }
        runFindAction(previous) {
            var _a;
            (_a = this.activeWebview) === null || _a === void 0 ? void 0 : _a.runFindAction(previous);
        }
        get activeWebview() {
            if (!this.activeElement || !this.activeElement.runFindAction) {
                return undefined;
            }
            return this.activeElement;
        }
        onNavbarChange(extension, { id, focus }, template) {
            if (this.editorLoadComplete) {
                /* __GDPR__
                    "extensionEditor:navbarChange" : {
                        "navItem": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "${include}": [
                            "${GalleryExtensionTelemetryData}"
                        ]
                    }
                */
                this.telemetryService.publicLog('extensionEditor:navbarChange', Object.assign(Object.assign({}, extension.telemetryData), { navItem: id }));
            }
            this.contentDisposables.clear();
            template.content.innerText = '';
            this.activeElement = null;
            if (id) {
                const cts = new cancellation_1.CancellationTokenSource();
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
                this.open(id, extension, template, cts.token)
                    .then(activeElement => {
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    this.activeElement = activeElement;
                    if (focus) {
                        this.focus();
                    }
                });
            }
        }
        open(id, extension, template, token) {
            switch (id) {
                case NavbarSection.Readme: return this.openReadme(template, token);
                case NavbarSection.Contributions: return this.openContributions(template, token);
                case NavbarSection.Changelog: return this.openChangelog(template, token);
                case NavbarSection.Dependencies: return this.openExtensionDependencies(extension, template, token);
                case NavbarSection.ExtensionPack: return this.openExtensionPack(extension, template, token);
            }
            return Promise.resolve(null);
        }
        async openMarkdown(cacheResult, noContentCopy, template, webviewIndex, token) {
            try {
                const body = await this.renderMarkdown(cacheResult, template);
                if (token.isCancellationRequested) {
                    return Promise.resolve(null);
                }
                const webview = this.contentDisposables.add(this.webviewService.createWebviewOverlay('extensionEditor', {
                    enableFindWidget: true,
                    tryRestoreScrollPosition: true,
                }, {}, undefined));
                webview.initialScrollProgress = this.initialScrollProgress.get(webviewIndex) || 0;
                webview.claim(this, this.scopedContextKeyService);
                (0, dom_1.setParentFlowTo)(webview.container, template.content);
                webview.layoutWebviewOverElement(template.content);
                webview.html = body;
                webview.claim(this, undefined);
                this.contentDisposables.add(webview.onDidFocus(() => this.fireOnDidFocus()));
                this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, {
                    layout: () => {
                        webview.layoutWebviewOverElement(template.content);
                    }
                });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                let isDisposed = false;
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                    // Render again since syntax highlighting of code blocks may have changed
                    const body = await this.renderMarkdown(cacheResult, template);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        webview.html = body;
                    }
                }));
                this.contentDisposables.add(webview.onDidClickLink(link => {
                    if (!link) {
                        return;
                    }
                    // Only allow links with specific schemes
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.http) || (0, opener_1.matchesScheme)(link, network_1.Schemas.https) || (0, opener_1.matchesScheme)(link, network_1.Schemas.mailto)) {
                        this.openerService.open(link);
                    }
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.command) && uri_1.URI.parse(link).path === update_1.ShowCurrentReleaseNotesActionId) {
                        this.openerService.open(link, { allowCommands: true }); // TODO@sandy081 use commands service
                    }
                }, null, this.contentDisposables));
                return webview;
            }
            catch (e) {
                const p = (0, dom_1.append)(template.content, (0, dom_1.$)('p.nocontent'));
                p.textContent = noContentCopy;
                return p;
            }
        }
        async renderMarkdown(cacheResult, template) {
            const contents = await this.loadContents(() => cacheResult, template);
            const content = await (0, markdownDocumentRenderer_1.renderMarkdownDocument)(contents, this.extensionService, this.modeService);
            return this.renderBody(content);
        }
        async renderBody(body) {
            const nonce = (0, uuid_1.generateUuid)();
            const colorMap = modes_1.TokenizationRegistry.getColorMap();
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}

					#scroll-to-top {
						position: fixed;
						width: 40px;
						height: 40px;
						right: 25px;
						bottom: 25px;
						background-color:#444444;
						border-radius: 50%;
						cursor: pointer;
						box-shadow: 1px 1px 1px rgba(0,0,0,.25);
						outline: none;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					#scroll-to-top:hover {
						background-color:#007acc;
						box-shadow: 2px 2px 2px rgba(0,0,0,.25);
					}

					body.vscode-light #scroll-to-top {
						background-color: #949494;
					}

					body.vscode-high-contrast #scroll-to-top:hover {
						background-color: #007acc;
					}

					body.vscode-high-contrast #scroll-to-top {
						background-color: black;
						border: 2px solid #6fc3df;
						box-shadow: none;
					}
					body.vscode-high-contrast #scroll-to-top:hover {
						background-color: #007acc;
					}

					#scroll-to-top span.icon::before {
						content: "";
						display: block;
						/* Chevron up icon */
						background:url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}
					${css}
				</style>
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
        }
        async openReadme(template, token) {
            var _a;
            const manifest = await this.extensionManifest.get().promise;
            if (manifest && ((_a = manifest.extensionPack) === null || _a === void 0 ? void 0 : _a.length) && this.shallRenderAsExensionPack(manifest)) {
                return this.openExtensionPackReadme(manifest, template, token);
            }
            return this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)(22, null), template, 0 /* Readme */, token);
        }
        shallRenderAsExensionPack(manifest) {
            var _a;
            return !!((_a = manifest.categories) === null || _a === void 0 ? void 0 : _a.some(category => category.toLowerCase() === 'extension packs'));
        }
        async openExtensionPackReadme(manifest, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const extensionPackReadme = (0, dom_1.append)(template.content, (0, dom_1.$)('div', { class: 'extension-pack-readme' }));
            extensionPackReadme.style.margin = '0 auto';
            extensionPackReadme.style.maxWidth = '882px';
            const extensionPack = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div', { class: 'extension-pack' }));
            if (manifest.extensionPack.length <= 3) {
                extensionPackReadme.classList.add('one-row');
            }
            else if (manifest.extensionPack.length <= 6) {
                extensionPackReadme.classList.add('two-rows');
            }
            else if (manifest.extensionPack.length <= 9) {
                extensionPackReadme.classList.add('three-rows');
            }
            else {
                extensionPackReadme.classList.add('more-rows');
            }
            const extensionPackHeader = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.header'));
            extensionPackHeader.textContent = (0, nls_1.localize)(23, null, manifest.extensionPack.length);
            const extensionPackContent = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div', { class: 'extension-pack-content' }));
            extensionPackContent.setAttribute('tabindex', '0');
            (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.footer'));
            const readmeContent = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div.readme-content'));
            await Promise.all([
                this.renderExtensionPack(manifest, extensionPackContent, token),
                this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)(24, null), Object.assign(Object.assign({}, template), { content: readmeContent }), 0 /* Readme */, token),
            ]);
            return { focus: () => extensionPackContent.focus() };
        }
        openChangelog(template, token) {
            return this.openMarkdown(this.extensionChangelog.get(), (0, nls_1.localize)(25, null), template, 1 /* Changelog */, token);
        }
        openContributions(template, token) {
            const content = (0, dom_1.$)('div', { class: 'subcontent', tabindex: '0' });
            return this.loadContents(() => this.extensionManifest.get(), template)
                .then(manifest => {
                if (token.isCancellationRequested) {
                    return null;
                }
                if (!manifest) {
                    return content;
                }
                const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
                const layout = () => scrollableContent.scanDomNode();
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                const renders = [
                    this.renderSettings(content, manifest, layout),
                    this.renderCommands(content, manifest, layout),
                    this.renderCodeActions(content, manifest, layout),
                    this.renderLanguages(content, manifest, layout),
                    this.renderColorThemes(content, manifest, layout),
                    this.renderIconThemes(content, manifest, layout),
                    this.renderProductIconThemes(content, manifest, layout),
                    this.renderColors(content, manifest, layout),
                    this.renderJSONValidation(content, manifest, layout),
                    this.renderDebuggers(content, manifest, layout),
                    this.renderViewContainers(content, manifest, layout),
                    this.renderViews(content, manifest, layout),
                    this.renderLocalizations(content, manifest, layout),
                    this.renderCustomEditors(content, manifest, layout),
                    this.renderAuthentication(content, manifest, layout),
                    this.renderActivationEvents(content, manifest, layout),
                ];
                scrollableContent.scanDomNode();
                const isEmpty = !renders.some(x => x);
                if (isEmpty) {
                    (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(26, null);
                    (0, dom_1.append)(template.content, content);
                }
                else {
                    (0, dom_1.append)(template.content, scrollableContent.getDomNode());
                    this.contentDisposables.add(scrollableContent);
                }
                return content;
            }, () => {
                if (token.isCancellationRequested) {
                    return null;
                }
                (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(27, null);
                (0, dom_1.append)(template.content, content);
                return content;
            });
        }
        openExtensionDependencies(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            if (arrays.isFalsyOrEmpty(extension.dependencies)) {
                (0, dom_1.append)(template.content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(28, null);
                return Promise.resolve(template.content);
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            this.contentDisposables.add(scrollableContent);
            const dependenciesTree = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsTree, new extensionsViewer_1.ExtensionData(extension, null, extension => extension.dependencies || [], this.extensionsWorkbenchService), content, {
                listBackground: colorRegistry_1.editorBackground
            });
            const layout = () => {
                scrollableContent.scanDomNode();
                const scrollDimensions = scrollableContent.getScrollDimensions();
                dependenciesTree.layout(scrollDimensions.height);
            };
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(dependenciesTree);
            scrollableContent.scanDomNode();
            return Promise.resolve({ focus() { dependenciesTree.domFocus(); } });
        }
        openExtensionPack(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            if (arrays.isFalsyOrEmpty(extension.extensionPack)) {
                (0, dom_1.append)(template.content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(29, null);
                return Promise.resolve(template.content);
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            this.contentDisposables.add(scrollableContent);
            const dependenciesTree = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsTree, new extensionsViewer_1.ExtensionData(extension, null, extension => extension.extensionPack || [], this.extensionsWorkbenchService), content, {
                listBackground: colorRegistry_1.editorBackground
            });
            const layout = () => {
                scrollableContent.scanDomNode();
                const scrollDimensions = scrollableContent.getScrollDimensions();
                dependenciesTree.layout(scrollDimensions.height);
            };
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(dependenciesTree);
            scrollableContent.scanDomNode();
            return Promise.resolve({ focus() { dependenciesTree.domFocus(); } });
        }
        async renderExtensionPack(manifest, parent, token) {
            if (token.isCancellationRequested) {
                return;
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, { useShadows: false });
            (0, dom_1.append)(parent, scrollableContent.getDomNode());
            const extensionsGridView = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsGridView, content, new extensionsList_1.Delegate());
            const extensions = await (0, extensionsViewer_1.getExtensions)(manifest.extensionPack, this.extensionsWorkbenchService);
            extensionsGridView.setExtensions(extensions);
            scrollableContent.scanDomNode();
            this.contentDisposables.add(scrollableContent);
            this.contentDisposables.add(extensionsGridView);
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(arrays.insert(this.layoutParticipants, { layout: () => scrollableContent.scanDomNode() })));
        }
        renderSettings(container, manifest, onDetailsToggle) {
            var _a;
            const configuration = (_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.configuration;
            let properties = {};
            if (Array.isArray(configuration)) {
                configuration.forEach(config => {
                    properties = Object.assign(Object.assign({}, properties), config.properties);
                });
            }
            else if (configuration) {
                properties = configuration.properties;
            }
            const contrib = properties ? Object.keys(properties) : [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(30, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(31, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(32, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(33, null))), ...contrib.map(key => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, key)), (0, dom_1.$)('td', undefined, properties[key].description || (properties[key].markdownDescription && (0, markdownRenderer_1.renderMarkdown)({ value: properties[key].markdownDescription }, { actionHandler: { callback: (content) => this.openerService.open(content).catch(errors_1.onUnexpectedError), disposeables: this.contentDisposables } }))), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, `${(0, types_1.isUndefined)(properties[key].default) ? (0, configurationRegistry_1.getDefaultValue)(properties[key].type) : properties[key].default}`))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderDebuggers(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.debuggers) || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(34, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(35, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(36, null))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.label), (0, dom_1.$)('td', undefined, d.type)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViewContainers(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.viewsContainers) || {};
            const viewContainers = Object.keys(contrib).reduce((result, location) => {
                let viewContainersForLocation = contrib[location];
                result.push(...viewContainersForLocation.map(viewContainer => (Object.assign(Object.assign({}, viewContainer), { location }))));
                return result;
            }, []);
            if (!viewContainers.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(37, null, viewContainers.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(38, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(39, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(40, null))), ...viewContainers.map(viewContainer => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, viewContainer.id), (0, dom_1.$)('td', undefined, viewContainer.title), (0, dom_1.$)('td', undefined, viewContainer.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViews(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.views) || {};
            const views = Object.keys(contrib).reduce((result, location) => {
                let viewsForLocation = contrib[location];
                result.push(...viewsForLocation.map(view => (Object.assign(Object.assign({}, view), { location }))));
                return result;
            }, []);
            if (!views.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(41, null, views.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(42, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(43, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(44, null))), ...views.map(view => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, view.id), (0, dom_1.$)('td', undefined, view.name), (0, dom_1.$)('td', undefined, view.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLocalizations(container, manifest, onDetailsToggle) {
            var _a;
            const localizations = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.localizations) || [];
            if (!localizations.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(45, null, localizations.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(46, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(47, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(48, null))), ...localizations.map(localization => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, localization.languageId), (0, dom_1.$)('td', undefined, localization.languageName || ''), (0, dom_1.$)('td', undefined, localization.localizedLanguageName || '')))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCustomEditors(container, manifest, onDetailsToggle) {
            var _a;
            const webviewEditors = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.customEditors) || [];
            if (!webviewEditors.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(49, null, webviewEditors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(50, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(51, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(52, null))), ...webviewEditors.map(webviewEditor => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, webviewEditor.viewType), (0, dom_1.$)('td', undefined, webviewEditor.priority), (0, dom_1.$)('td', undefined, arrays.coalesce(webviewEditor.selector.map(x => x.filenamePattern)).join(', '))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCodeActions(container, manifest, onDetailsToggle) {
            var _a;
            const codeActions = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.codeActions) || [];
            if (!codeActions.length) {
                return false;
            }
            const flatActions = arrays.flatten(codeActions.map(contribution => contribution.actions.map(action => (Object.assign(Object.assign({}, action), { languages: contribution.languages })))));
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(53, null, flatActions.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(54, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(55, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(56, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(57, null))), ...flatActions.map(action => {
                var _a;
                return (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.title), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, action.kind)), (0, dom_1.$)('td', undefined, (_a = action.description) !== null && _a !== void 0 ? _a : ''), (0, dom_1.$)('td', undefined, ...action.languages.map(language => (0, dom_1.$)('code', undefined, language))));
            })));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderAuthentication(container, manifest, onDetailsToggle) {
            var _a;
            const authentication = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.authentication) || [];
            if (!authentication.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(58, null, authentication.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(59, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(60, null))), ...authentication.map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.label), (0, dom_1.$)('td', undefined, action.id)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColorThemes(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.themes) || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(61, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderIconThemes(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.iconThemes) || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(62, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderProductIconThemes(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.productIconThemes) || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(63, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColors(container, manifest, onDetailsToggle) {
            var _a;
            const colors = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.colors) || [];
            if (!colors.length) {
                return false;
            }
            function colorPreview(colorReference) {
                let result = [];
                if (colorReference && colorReference[0] === '#') {
                    let color = color_1.Color.fromHex(colorReference);
                    if (color) {
                        result.push((0, dom_1.$)('span', { class: 'colorBox', style: 'background-color: ' + color_1.Color.Format.CSS.format(color) }, ''));
                    }
                }
                result.push((0, dom_1.$)('code', undefined, colorReference));
                return result;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(64, null, colors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(65, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(66, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(67, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(68, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(69, null))), ...colors.map(color => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, color.id)), (0, dom_1.$)('td', undefined, color.description), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.dark)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.light)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.highContrast))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderJSONValidation(container, manifest, onDetailsToggle) {
            var _a;
            const contrib = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.jsonValidation) || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(70, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(71, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(72, null))), ...contrib.map(v => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, Array.isArray(v.fileMatch) ? v.fileMatch.join(', ') : v.fileMatch)), (0, dom_1.$)('td', undefined, v.url)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCommands(container, manifest, onDetailsToggle) {
            var _a, _b, _c;
            const rawCommands = ((_a = manifest.contributes) === null || _a === void 0 ? void 0 : _a.commands) || [];
            const commands = rawCommands.map(c => ({
                id: c.command,
                title: c.title,
                keybindings: [],
                menus: []
            }));
            const byId = arrays.index(commands, c => c.id);
            const menus = ((_b = manifest.contributes) === null || _b === void 0 ? void 0 : _b.menus) || {};
            Object.keys(menus).forEach(context => {
                menus[context].forEach(menu => {
                    let command = byId[menu.command];
                    if (command) {
                        command.menus.push(context);
                    }
                    else {
                        command = { id: menu.command, title: '', keybindings: [], menus: [context] };
                        byId[command.id] = command;
                        commands.push(command);
                    }
                });
            });
            const rawKeybindings = ((_c = manifest.contributes) === null || _c === void 0 ? void 0 : _c.keybindings) ? (Array.isArray(manifest.contributes.keybindings) ? manifest.contributes.keybindings : [manifest.contributes.keybindings]) : [];
            rawKeybindings.forEach(rawKeybinding => {
                const keybinding = this.resolveKeybinding(rawKeybinding);
                if (!keybinding) {
                    return;
                }
                let command = byId[rawKeybinding.command];
                if (command) {
                    command.keybindings.push(keybinding);
                }
                else {
                    command = { id: rawKeybinding.command, title: '', keybindings: [keybinding], menus: [] };
                    byId[command.id] = command;
                    commands.push(command);
                }
            });
            if (!commands.length) {
                return false;
            }
            this.keybindingLabelStylers.clear();
            const renderKeybinding = (keybinding) => {
                const element = (0, dom_1.$)('');
                const kbl = new keybindingLabel_1.KeybindingLabel(element, platform_1.OS);
                kbl.set(keybinding);
                this.keybindingLabelStylers.add((0, styler_1.attachKeybindingLabelStyler)(kbl, this.themeService));
                return element;
            };
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(73, null, commands.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(74, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(75, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(76, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(77, null))), ...commands.map(c => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, c.id)), (0, dom_1.$)('td', undefined, c.title), (0, dom_1.$)('td', undefined, ...c.keybindings.map(keybinding => renderKeybinding(keybinding))), (0, dom_1.$)('td', undefined, ...c.menus.map(context => (0, dom_1.$)('code', undefined, context)))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLanguages(container, manifest, onDetailsToggle) {
            const contributes = manifest.contributes;
            const rawLanguages = (contributes === null || contributes === void 0 ? void 0 : contributes.languages) || [];
            const languages = rawLanguages.map(l => ({
                id: l.id,
                name: (l.aliases || [])[0] || l.id,
                extensions: l.extensions || [],
                hasGrammar: false,
                hasSnippets: false
            }));
            const byId = arrays.index(languages, l => l.id);
            const grammars = (contributes === null || contributes === void 0 ? void 0 : contributes.grammars) || [];
            grammars.forEach(grammar => {
                let language = byId[grammar.language];
                if (language) {
                    language.hasGrammar = true;
                }
                else {
                    language = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            const snippets = (contributes === null || contributes === void 0 ? void 0 : contributes.snippets) || [];
            snippets.forEach(snippet => {
                let language = byId[snippet.language];
                if (language) {
                    language.hasSnippets = true;
                }
                else {
                    language = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            if (!languages.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(78, null, languages.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(79, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(80, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(81, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(82, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(83, null))), ...languages.map(l => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, l.id), (0, dom_1.$)('td', undefined, l.name), (0, dom_1.$)('td', undefined, ...(0, dom_1.join)(l.extensions.map(ext => (0, dom_1.$)('code', undefined, ext)), ' ')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasGrammar ? '✔︎' : '—')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasSnippets ? '✔︎' : '—'))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderActivationEvents(container, manifest, onDetailsToggle) {
            const activationEvents = manifest.activationEvents || [];
            if (!activationEvents.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(84, null, activationEvents.length)), (0, dom_1.$)('ul', undefined, ...activationEvents.map(activationEvent => (0, dom_1.$)('li', undefined, (0, dom_1.$)('code', undefined, activationEvent)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        resolveKeybinding(rawKeyBinding) {
            let key;
            switch (process_1.platform) {
                case 'win32':
                    key = rawKeyBinding.win;
                    break;
                case 'linux':
                    key = rawKeyBinding.linux;
                    break;
                case 'darwin':
                    key = rawKeyBinding.mac;
                    break;
            }
            const keyBinding = keybindingParser_1.KeybindingParser.parseKeybinding(key || rawKeyBinding.key, platform_1.OS);
            if (keyBinding) {
                return this.keybindingService.resolveKeybinding(keyBinding)[0];
            }
            return null;
        }
        loadContents(loadingTask, template) {
            template.content.classList.add('loading');
            const result = this.contentDisposables.add(loadingTask());
            const onDone = () => template.content.classList.remove('loading');
            result.promise.then(onDone, onDone);
            return result.promise;
        }
        layout() {
            this.layoutParticipants.forEach(p => p.layout());
        }
        onError(err) {
            if ((0, errors_1.isPromiseCanceledError)(err)) {
                return;
            }
            this.notificationService.error(err);
        }
    };
    ExtensionEditor.ID = 'workbench.editor.extension';
    ExtensionEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, viewlet_1.IViewletService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, themeService_1.IThemeService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, notification_1.INotificationService),
        __param(7, opener_1.IOpenerService),
        __param(8, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(9, extensionRecommendations_1.IExtensionIgnoredRecommendationsService),
        __param(10, storage_1.IStorageService),
        __param(11, extensions_2.IExtensionService),
        __param(12, workbenchThemeService_1.IWorkbenchThemeService),
        __param(13, webview_1.IWebviewService),
        __param(14, modeService_1.IModeService),
        __param(15, contextView_1.IContextMenuService)
    ], ExtensionEditor);
    exports.ExtensionEditor = ExtensionEditor;
    const contextKeyExpr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', ExtensionEditor.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated());
    (0, actions_2.registerAction2)(class ShowExtensionEditorFindAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.showfind',
                title: (0, nls_1.localize)(85, null),
                keybinding: {
                    when: contextKeyExpr,
                    weight: 100 /* EditorContrib */,
                    primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */,
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            if (extensionEditor) {
                extensionEditor.showFind();
            }
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindNextAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findNext',
                title: (0, nls_1.localize)(86, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 3 /* Enter */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            if (extensionEditor) {
                extensionEditor.runFindAction(false);
            }
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindPreviousAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findPrevious',
                title: (0, nls_1.localize)(87, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 1024 /* Shift */ | 3 /* Enter */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            if (extensionEditor) {
                extensionEditor.runFindAction(true);
            }
        }
    });
    function getExtensionEditor(accessor) {
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane instanceof ExtensionEditor) {
            return activeEditorPane;
        }
        return null;
    }
});
//# sourceMappingURL=extensionEditor.js.map