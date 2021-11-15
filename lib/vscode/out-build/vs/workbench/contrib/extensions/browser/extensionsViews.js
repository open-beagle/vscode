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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsViews", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/paging", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/services/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/theme/common/styler", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/views/viewPane", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/workbench/contrib/experiments/common/experimentService", "vs/base/browser/ui/aria/aria", "vs/base/common/cancellation", "vs/base/common/actions", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/platform/product/common/productService", "vs/platform/severityIcon/common/severityIcon", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/workbench/services/preferences/common/preferences", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, nls_1, lifecycle_1, event_1, errors_1, paging_1, extensionManagement_1, extensionRecommendations_1, extensionManagementUtil_1, keybinding_1, contextView_1, dom_1, instantiation_1, extensionsList_1, extensions_1, extensionQuery_1, extensions_2, themeService_1, styler_1, telemetry_1, countBadge_1, extensionsActions_1, listService_1, configuration_1, notification_1, viewPane_1, workspace_1, arrays_1, experimentService_1, aria_1, cancellation_1, actions_1, extensions_3, async_1, productService_1, severityIcon_1, contextkey_1, theme_1, views_1, opener_1, preferences_1, storage_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceRecommendedExtensionsView = exports.RecommendedExtensionsView = exports.DefaultRecommendedExtensionsView = exports.TrustRequiredOnDemandExtensionsView = exports.TrustRequiredOnStartExtensionsView = exports.BuiltInProgrammingLanguageExtensionsView = exports.BuiltInThemesExtensionsView = exports.BuiltInFeatureExtensionsView = exports.DisabledExtensionsView = exports.EnabledExtensionsView = exports.ServerInstalledExtensionsView = exports.ExtensionsListView = void 0;
    // Extensions that are automatically classified as Programming Language extensions, but should be Feature extensions
    const FORCE_FEATURE_EXTENSIONS = ['vscode.git', 'vscode.search-result'];
    class ExtensionsViewState extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this.currentlyFocusedItems = [];
        }
        onFocusChange(extensions) {
            this.currentlyFocusedItems.forEach(extension => this._onBlur.fire(extension));
            this.currentlyFocusedItems = extensions;
            this.currentlyFocusedItems.forEach(extension => this._onFocus.fire(extension));
        }
    }
    class ExtensionListViewWarning extends Error {
    }
    let ExtensionsListView = class ExtensionsListView extends viewPane_1.ViewPane {
        constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, experimentService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService) {
            super(Object.assign(Object.assign({}, viewletViewOptions), { showActionsAlways: true, maximumBodySize: options.fixedHeight ? storageService.getNumber(viewletViewOptions.id, 0 /* GLOBAL */, 0) : undefined }), keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.options = options;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.contextService = contextService;
            this.experimentService = experimentService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.extensionManagementService = extensionManagementService;
            this.productService = productService;
            this.preferencesService = preferencesService;
            this.storageService = storageService;
            this.list = null;
            this.queryRequest = null;
            this.contextMenuActionRunner = this._register(new actions_1.ActionRunner());
            if (this.options.onDidChangeTitle) {
                this._register(this.options.onDidChangeTitle(title => this.updateTitle(title)));
            }
            this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
            this.registerActions();
        }
        registerActions() { }
        renderHeader(container) {
            container.classList.add('extension-view-header');
            super.renderHeader(container);
            this.badge = new countBadge_1.CountBadge((0, dom_1.append)(container, (0, dom_1.$)('.count-badge-wrapper')));
            this._register((0, styler_1.attachBadgeStyler)(this.badge, this.themeService));
        }
        renderBody(container) {
            super.renderBody(container);
            const extensionsList = (0, dom_1.append)(container, (0, dom_1.$)('.extensions-list'));
            const messageContainer = (0, dom_1.append)(container, (0, dom_1.$)('.message-container'));
            const messageSeverityIcon = (0, dom_1.append)(messageContainer, (0, dom_1.$)(''));
            const messageBox = (0, dom_1.append)(messageContainer, (0, dom_1.$)('.message'));
            const delegate = new extensionsList_1.Delegate();
            const extensionsViewState = new ExtensionsViewState();
            const renderer = this.instantiationService.createInstance(extensionsList_1.Renderer, extensionsViewState);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchPagedList, 'Extensions', extensionsList, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                accessibilityProvider: {
                    getAriaLabel(extension) {
                        return extension ? (0, nls_1.localize)(0, null, extension.displayName, extension.version, extension.publisherDisplayName, extension.description) : '';
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(1, null);
                    }
                },
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                },
                openOnSingleClick: true
            });
            this._register(this.list.onContextMenu(e => this.onContextMenu(e), this));
            this._register(this.list.onDidChangeFocus(e => extensionsViewState.onFocusChange((0, arrays_1.coalesce)(e.elements)), this));
            this._register(this.list);
            this._register(extensionsViewState);
            this._register(event_1.Event.debounce(event_1.Event.filter(this.list.onDidOpen, e => e.element !== null), (_, event) => event, 75, true)(options => {
                this.openExtension(options.element, Object.assign({ sideByside: options.sideBySide }, options.editorOptions));
            }));
            this.bodyTemplate = {
                extensionsList,
                messageBox,
                messageContainer,
                messageSeverityIcon
            };
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            if (this.bodyTemplate) {
                this.bodyTemplate.extensionsList.style.height = height + 'px';
            }
            if (this.list) {
                this.list.layout(height, width);
            }
        }
        async show(query, refresh) {
            if (this.queryRequest) {
                if (!refresh && this.queryRequest.query === query) {
                    return this.queryRequest.request;
                }
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            const parsedQuery = extensionQuery_1.Query.parse(query);
            let options = {
                sortOrder: 0 /* Default */
            };
            switch (parsedQuery.sortBy) {
                case 'installs':
                    options.sortBy = 4 /* InstallCount */;
                    break;
                case 'rating':
                    options.sortBy = 12 /* WeightedRating */;
                    break;
                case 'name':
                    options.sortBy = 2 /* Title */;
                    break;
                case 'publishedDate':
                    options.sortBy = 5 /* PublishedDate */;
                    break;
            }
            const request = (0, async_1.createCancelablePromise)(async (token) => {
                try {
                    this.queryResult = await this.query(parsedQuery, options, token);
                    const model = this.queryResult.model;
                    this.setModel(model);
                    if (this.queryResult.onDidChangeModel) {
                        this.queryResult.disposables.add(this.queryResult.onDidChangeModel(model => this.updateModel(model)));
                    }
                    return model;
                }
                catch (e) {
                    const model = new paging_1.PagedModel([]);
                    if (!(0, errors_1.isPromiseCanceledError)(e)) {
                        this.setModel(model, e);
                    }
                    return this.list ? this.list.model : model;
                }
            });
            request.finally(() => this.queryRequest = null);
            this.queryRequest = { query, request };
            return request;
        }
        count() {
            return this.list ? this.list.length : 0;
        }
        showEmptyModel() {
            const emptyModel = new paging_1.PagedModel([]);
            this.setModel(emptyModel);
            return Promise.resolve(emptyModel);
        }
        async onContextMenu(e) {
            if (e.element) {
                const runningExtensions = await this.extensionService.getExtensions();
                const manageExtensionAction = this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction);
                manageExtensionAction.extension = e.element;
                let groups = [];
                if (manageExtensionAction.enabled) {
                    groups = await manageExtensionAction.getActionGroups(runningExtensions);
                }
                else if (e.element) {
                    groups = (0, extensionsActions_1.getContextMenuActions)(e.element, false, this.instantiationService);
                    groups.forEach(group => group.forEach(extensionAction => {
                        if (extensionAction instanceof extensionsActions_1.ExtensionAction) {
                            extensionAction.extension = e.element;
                        }
                    }));
                }
                let actions = [];
                for (const menuActions of groups) {
                    actions = [...actions, ...menuActions, new actions_1.Separator()];
                }
                actions.pop();
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    actionRunner: this.contextMenuActionRunner,
                });
            }
        }
        async query(query, options, token) {
            const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
            const ids = [];
            let idMatch;
            while ((idMatch = idRegex.exec(query.value)) !== null) {
                const name = idMatch[1];
                ids.push(name);
            }
            if (ids.length) {
                const model = await this.queryByIds(ids, options, token);
                return { model, disposables: new lifecycle_1.DisposableStore() };
            }
            if (ExtensionsListView.isLocalExtensionsQuery(query.value)) {
                return this.queryLocal(query, options);
            }
            try {
                const model = await this.queryGallery(query, options, token);
                return { model, disposables: new lifecycle_1.DisposableStore() };
            }
            catch (e) {
                console.warn('Error querying extensions gallery', (0, errors_1.getErrorMessage)(e));
                return Promise.reject(new ExtensionListViewWarning((0, nls_1.localize)(2, null)));
            }
        }
        async queryByIds(ids, options, token) {
            const idsSet = ids.reduce((result, id) => { result.add(id.toLowerCase()); return result; }, new Set());
            const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .filter(e => idsSet.has(e.identifier.id.toLowerCase()));
            if (result.length) {
                return this.getPagedModel(this.sortExtensions(result, options));
            }
            return this.extensionsWorkbenchService.queryGallery({ names: ids, source: 'queryById' }, token)
                .then(pager => this.getPagedModel(pager));
        }
        async queryLocal(query, options) {
            const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
            const runningExtensions = await this.extensionService.getExtensions();
            let { extensions, canIncludeInstalledExtensions } = this.filterLocal(local, runningExtensions, query, options);
            const disposables = new lifecycle_1.DisposableStore();
            const onDidChangeModel = disposables.add(new event_1.Emitter());
            if (canIncludeInstalledExtensions) {
                let isDisposed = false;
                disposables.add((0, lifecycle_1.toDisposable)(() => isDisposed = true));
                disposables.add(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.extensionsWorkbenchService.onChange, e => (e === null || e === void 0 ? void 0 : e.state) === 1 /* Installed */), this.extensionService.onDidChangeExtensions), () => undefined)(async () => {
                    const local = this.options.server ? this.extensionsWorkbenchService.installed.filter(e => e.server === this.options.server) : this.extensionsWorkbenchService.local;
                    const runningExtensions = await this.extensionService.getExtensions();
                    const { extensions: newExtensions } = this.filterLocal(local, runningExtensions, query, options);
                    if (!isDisposed) {
                        const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
                        if (mergedExtensions) {
                            extensions = mergedExtensions;
                            onDidChangeModel.fire(new paging_1.PagedModel(extensions));
                        }
                    }
                }));
            }
            return {
                model: new paging_1.PagedModel(extensions),
                onDidChangeModel: onDidChangeModel.event,
                disposables
            };
        }
        filterLocal(local, runningExtensions, query, options) {
            let value = query.value;
            let extensions = [];
            let canIncludeInstalledExtensions = true;
            if (/@builtin/i.test(value)) {
                extensions = this.filterBuiltinExtensions(local, query, options);
                canIncludeInstalledExtensions = false;
            }
            else if (/@installed/i.test(value)) {
                extensions = this.filterInstalledExtensions(local, runningExtensions, query, options);
            }
            else if (/@outdated/i.test(value)) {
                extensions = this.filterOutdatedExtensions(local, query, options);
            }
            else if (/@disabled/i.test(value)) {
                extensions = this.filterDisabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@enabled/i.test(value)) {
                extensions = this.filterEnabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@trustRequired/i.test(value)) {
                extensions = this.filterTrustRequiredExtensions(local, query, options);
            }
            return { extensions, canIncludeInstalledExtensions };
        }
        filterBuiltinExtensions(local, query, options) {
            let value = query.value;
            const showThemesOnly = /@builtin:themes/i.test(value);
            if (showThemesOnly) {
                value = value.replace(/@builtin:themes/g, '');
            }
            const showBasicsOnly = /@builtin:basics/i.test(value);
            if (showBasicsOnly) {
                value = value.replace(/@builtin:basics/g, '');
            }
            const showFeaturesOnly = /@builtin:features/i.test(value);
            if (showFeaturesOnly) {
                value = value.replace(/@builtin:features/g, '');
            }
            value = value.replace(/@builtin/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            let result = local
                .filter(e => e.isBuiltin && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
            const isThemeExtension = (e) => {
                var _a, _b, _c, _d, _e, _f;
                return (Array.isArray((_c = (_b = (_a = e.local) === null || _a === void 0 ? void 0 : _a.manifest) === null || _b === void 0 ? void 0 : _b.contributes) === null || _c === void 0 ? void 0 : _c.themes) && e.local.manifest.contributes.themes.length > 0)
                    || (Array.isArray((_f = (_e = (_d = e.local) === null || _d === void 0 ? void 0 : _d.manifest) === null || _e === void 0 ? void 0 : _e.contributes) === null || _f === void 0 ? void 0 : _f.iconThemes) && e.local.manifest.contributes.iconThemes.length > 0);
            };
            if (showThemesOnly) {
                const themesExtensions = result.filter(isThemeExtension);
                return this.sortExtensions(themesExtensions, options);
            }
            const isLangaugeBasicExtension = (e) => {
                var _a, _b, _c;
                return FORCE_FEATURE_EXTENSIONS.indexOf(e.identifier.id) === -1
                    && (Array.isArray((_c = (_b = (_a = e.local) === null || _a === void 0 ? void 0 : _a.manifest) === null || _b === void 0 ? void 0 : _b.contributes) === null || _c === void 0 ? void 0 : _c.grammars) && e.local.manifest.contributes.grammars.length > 0);
            };
            if (showBasicsOnly) {
                const basics = result.filter(isLangaugeBasicExtension);
                return this.sortExtensions(basics, options);
            }
            if (showFeaturesOnly) {
                const others = result.filter(e => {
                    return e.local
                        && e.local.manifest
                        && !isThemeExtension(e)
                        && !isLangaugeBasicExtension(e);
                });
                return this.sortExtensions(others, options);
            }
            return this.sortExtensions(result, options);
        }
        parseCategories(value) {
            const categories = [];
            value = value.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                const entry = (category || quotedCategory || '').toLowerCase();
                if (categories.indexOf(entry) === -1) {
                    categories.push(entry);
                }
                return '';
            });
            return { value, categories };
        }
        filterInstalledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@installed/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            let result = local
                .filter(e => !e.isBuiltin
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            if (options.sortBy !== undefined) {
                result = this.sortExtensions(result, options);
            }
            else {
                const runningExtensionsById = runningExtensions.reduce((result, e) => { result.set(extensions_3.ExtensionIdentifier.toKey(e.identifier.value), e); return result; }, new Map());
                result = result.sort((e1, e2) => {
                    const running1 = runningExtensionsById.get(extensions_3.ExtensionIdentifier.toKey(e1.identifier.id));
                    const isE1Running = running1 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running1)) === e1.server;
                    const running2 = runningExtensionsById.get(extensions_3.ExtensionIdentifier.toKey(e2.identifier.id));
                    const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running2)) === e2.server;
                    if ((isE1Running && isE2Running)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    const isE1LanguagePackExtension = e1.local && (0, extensions_3.isLanguagePackExtension)(e1.local.manifest);
                    const isE2LanguagePackExtension = e2.local && (0, extensions_3.isLanguagePackExtension)(e2.local.manifest);
                    if (!isE1Running && !isE2Running) {
                        if (isE1LanguagePackExtension) {
                            return -1;
                        }
                        if (isE2LanguagePackExtension) {
                            return 1;
                        }
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    if ((isE1Running && isE2LanguagePackExtension) || (isE2Running && isE1LanguagePackExtension)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    return isE1Running ? -1 : 1;
                });
            }
            return result;
        }
        filterOutdatedExtensions(local, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@outdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(extension => extension.outdated
                && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => !!extension.local && extension.local.manifest.categories.some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterDisabledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@disabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterEnabledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value ? value.replace(/@enabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase() : '';
            local = local.filter(e => !e.isBuiltin);
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterTrustRequiredExtensions(local, query, options) {
            let value = query.value;
            const onStartOnly = /@trustRequired:onStart/i.test(value);
            if (onStartOnly) {
                value = value.replace(/@trustRequired:onStart/g, '');
            }
            const onDemandOnly = /@trustRequired:onDemand/i.test(value);
            if (onDemandOnly) {
                value = value.replace(/@trustRequired:onDemand/g, '');
            }
            value = value.replace(/@trustRequired/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local.filter(extension => extension.local && this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) !== true && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1));
            if (onStartOnly) {
                const onStartExtensions = result.filter(extension => extension.local && this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === false);
                return this.sortExtensions(onStartExtensions, options);
            }
            if (onDemandOnly) {
                const onDemandExtensions = result.filter(extension => extension.local && this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === 'limited');
                return this.sortExtensions(onDemandExtensions, options);
            }
            return this.sortExtensions(result, options);
        }
        mergeAddedExtensions(extensions, newExtensions) {
            const oldExtensions = [...extensions];
            const findPreviousExtensionIndex = (from) => {
                let index = -1;
                const previousExtensionInNew = newExtensions[from];
                if (previousExtensionInNew) {
                    index = oldExtensions.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, previousExtensionInNew.identifier));
                    if (index === -1) {
                        return findPreviousExtensionIndex(from - 1);
                    }
                }
                return index;
            };
            let hasChanged = false;
            for (let index = 0; index < newExtensions.length; index++) {
                const extension = newExtensions[index];
                if (extensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)(r.identifier, extension.identifier))) {
                    hasChanged = true;
                    extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
                }
            }
            return hasChanged ? extensions : undefined;
        }
        async queryGallery(query, options, token) {
            const hasUserDefinedSortOrder = options.sortBy !== undefined;
            if (!hasUserDefinedSortOrder && !query.value.trim()) {
                options.sortBy = 4 /* InstallCount */;
            }
            if (this.isRecommendationsQuery(query)) {
                return this.queryRecommendations(query, options, token);
            }
            if (/\bcurated:([^\s]+)\b/.test(query.value)) {
                return this.getCuratedModel(query, options, token);
            }
            const text = query.value;
            if (/\bext:([^\s]+)\b/g.test(text)) {
                options.text = text;
                options.source = 'file-extension-tags';
                return this.extensionsWorkbenchService.queryGallery(options, token).then(pager => this.getPagedModel(pager));
            }
            let preferredResults = [];
            if (text) {
                options.text = text.substr(0, 350);
                options.source = 'searchText';
                if (!hasUserDefinedSortOrder) {
                    const searchExperiments = await this.getSearchExperiments();
                    for (const experiment of searchExperiments) {
                        if (experiment.action && text.toLowerCase() === experiment.action.properties['searchText'] && Array.isArray(experiment.action.properties['preferredResults'])) {
                            preferredResults = experiment.action.properties['preferredResults'];
                            options.source += `-experiment-${experiment.id}`;
                            break;
                        }
                    }
                }
            }
            else {
                options.source = 'viewlet';
            }
            const pager = await this.extensionsWorkbenchService.queryGallery(options, token);
            let positionToUpdate = 0;
            for (const preferredResult of preferredResults) {
                for (let j = positionToUpdate; j < pager.firstPage.length; j++) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(pager.firstPage[j].identifier, { id: preferredResult })) {
                        if (positionToUpdate !== j) {
                            const preferredExtension = pager.firstPage.splice(j, 1)[0];
                            pager.firstPage.splice(positionToUpdate, 0, preferredExtension);
                            positionToUpdate++;
                        }
                        break;
                    }
                }
            }
            return this.getPagedModel(pager);
        }
        getSearchExperiments() {
            if (!this._searchExperiments) {
                this._searchExperiments = this.experimentService.getExperimentsByType(experimentService_1.ExperimentActionType.ExtensionSearchResults);
            }
            return this._searchExperiments;
        }
        sortExtensions(extensions, options) {
            switch (options.sortBy) {
                case 4 /* InstallCount */:
                    extensions = extensions.sort((e1, e2) => typeof e2.installCount === 'number' && typeof e1.installCount === 'number' ? e2.installCount - e1.installCount : NaN);
                    break;
                case 6 /* AverageRating */:
                case 12 /* WeightedRating */:
                    extensions = extensions.sort((e1, e2) => typeof e2.rating === 'number' && typeof e1.rating === 'number' ? e2.rating - e1.rating : NaN);
                    break;
                default:
                    extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                    break;
            }
            if (options.sortOrder === 2 /* Descending */) {
                extensions = extensions.reverse();
            }
            return extensions;
        }
        async getCuratedModel(query, options, token) {
            const value = query.value.replace(/curated:/g, '').trim();
            const names = await this.experimentService.getCuratedExtensionsList(value);
            if (Array.isArray(names) && names.length) {
                options.source = `curated:${value}`;
                options.names = names;
                options.pageSize = names.length;
                const pager = await this.extensionsWorkbenchService.queryGallery(options, token);
                this.sortFirstPage(pager, names);
                return this.getPagedModel(pager || []);
            }
            return new paging_1.PagedModel([]);
        }
        isRecommendationsQuery(query) {
            return ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)
                || ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)
                || ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)
                || /@recommended:all/i.test(query.value)
                || ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value)
                || ExtensionsListView.isRecommendedExtensionsQuery(query.value);
        }
        async queryRecommendations(query, options, token) {
            // Workspace recommendations
            if (ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)) {
                return this.getWorkspaceRecommendationsModel(query, options, token);
            }
            // Keymap recommendations
            if (ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)) {
                return this.getKeymapRecommendationsModel(query, options, token);
            }
            // Exe recommendations
            if (ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)) {
                return this.getExeRecommendationsModel(query, options, token);
            }
            // All recommendations
            if (/@recommended:all/i.test(query.value)) {
                return this.getAllRecommendationsModel(options, token);
            }
            // Search recommendations
            if (ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) ||
                (ExtensionsListView.isRecommendedExtensionsQuery(query.value) && options.sortBy !== undefined)) {
                return this.searchRecommendations(query, options, token);
            }
            // Other recommendations
            if (ExtensionsListView.isRecommendedExtensionsQuery(query.value)) {
                return this.getOtherRecommendationsModel(query, options, token);
            }
            return new paging_1.PagedModel([]);
        }
        async getInstallableRecommendations(recommendations, options, token) {
            const extensions = [];
            if (recommendations.length) {
                const pager = await this.extensionsWorkbenchService.queryGallery(Object.assign(Object.assign({}, options), { names: recommendations, pageSize: recommendations.length }), token);
                for (const extension of pager.firstPage) {
                    if (extension.gallery && (await this.extensionManagementService.canInstall(extension.gallery))) {
                        extensions.push(extension);
                    }
                }
            }
            return extensions;
        }
        async getWorkspaceRecommendations() {
            const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
            const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
            for (const configBasedRecommendation of important) {
                if (!recommendations.find(extensionId => extensionId === configBasedRecommendation)) {
                    recommendations.push(configBasedRecommendation);
                }
            }
            return recommendations;
        }
        async getWorkspaceRecommendationsModel(query, options, token) {
            const recommendations = await this.getWorkspaceRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, Object.assign(Object.assign({}, options), { source: 'recommendations-workspace' }), token));
            this.telemetryService.publicLog2('extensionWorkspaceRecommendations:open', { count: installableRecommendations.length });
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getKeymapRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:keymaps/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, Object.assign(Object.assign({}, options), { source: 'recommendations-keymaps' }), token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getExeRecommendationsModel(query, options, token) {
            const exe = query.value.replace(/@exe:/g, '').trim().toLowerCase();
            const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
            const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], Object.assign(Object.assign({}, options), { source: 'recommendations-exe' }), token);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getOtherRecommendationsModel(query, options, token) {
            const otherRecommendations = await this.getOtherRecommendations();
            const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, Object.assign(Object.assign({}, options), { source: 'recommendations-other', sortBy: undefined }), token);
            const result = (0, arrays_1.coalesce)(otherRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getOtherRecommendations() {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .map(e => e.identifier.id.toLowerCase());
            const workspaceRecommendations = (await this.getWorkspaceRecommendations())
                .map(extensionId => extensionId.toLowerCase());
            return (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
        }
        // Get All types of recommendations, trimmed to show a max of 8 at any given time
        async getAllRecommendationsModel(options, token) {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map(e => e.identifier.id.toLowerCase());
            const allRecommendations = (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.getWorkspaceRecommendations(),
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
            const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, Object.assign(Object.assign({}, options), { source: 'recommendations-all', sortBy: undefined }), token);
            const result = (0, arrays_1.coalesce)(allRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result.slice(0, 8));
        }
        async searchRecommendations(query, options, token) {
            const value = query.value.replace(/@recommended/g, '').trim().toLowerCase();
            const recommendations = (0, arrays_1.distinct)([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, Object.assign(Object.assign({}, options), { source: 'recommendations', sortBy: undefined }), token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(this.sortExtensions(result, options));
        }
        // Sorts the firstPage of the pager in the same order as given array of extension ids
        sortFirstPage(pager, ids) {
            ids = ids.map(x => x.toLowerCase());
            pager.firstPage.sort((a, b) => {
                return ids.indexOf(a.identifier.id.toLowerCase()) < ids.indexOf(b.identifier.id.toLowerCase()) ? -1 : 1;
            });
        }
        setModel(model, error) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                this.list.scrollTop = 0;
                this.updateBody(error);
            }
        }
        updateBody(error) {
            const count = this.count();
            if (this.bodyTemplate && this.badge) {
                this.bodyTemplate.extensionsList.classList.toggle('hidden', count === 0);
                this.bodyTemplate.messageContainer.classList.toggle('hidden', count > 0);
                this.badge.setCount(count);
                if (count === 0 && this.isBodyVisible()) {
                    if (error) {
                        if (error instanceof ExtensionListViewWarning) {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Warning);
                            this.bodyTemplate.messageBox.textContent = (0, errors_1.getErrorMessage)(error);
                        }
                        else {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Error);
                            this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)(3, null, (0, errors_1.getErrorMessage)(error));
                        }
                    }
                    else {
                        this.bodyTemplate.messageSeverityIcon.className = '';
                        this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)(4, null);
                    }
                    (0, aria_1.alert)(this.bodyTemplate.messageBox.textContent);
                }
            }
            this.updateSize();
        }
        updateSize() {
            var _a;
            if (this.options.fixedHeight) {
                const length = ((_a = this.list) === null || _a === void 0 ? void 0 : _a.model.length) || 0;
                this.minimumBodySize = Math.min(length, 3) * extensionsList_1.EXTENSION_LIST_ELEMENT_HEIGHT;
                this.maximumBodySize = length * extensionsList_1.EXTENSION_LIST_ELEMENT_HEIGHT;
                this.storageService.store(this.id, this.maximumBodySize, 0 /* GLOBAL */, 1 /* MACHINE */);
            }
        }
        updateModel(model) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                this.updateBody();
            }
        }
        openExtension(extension, options) {
            extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0] || extension;
            this.extensionsWorkbenchService.open(extension, options).then(undefined, err => this.onError(err));
        }
        onError(err) {
            if ((0, errors_1.isPromiseCanceledError)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/ECONNREFUSED/.test(message)) {
                const error = (0, errors_1.createErrorWithActions)((0, nls_1.localize)(5, null), {
                    actions: [
                        new actions_1.Action('open user settings', (0, nls_1.localize)(6, null), undefined, true, () => this.preferencesService.openGlobalSettings())
                    ]
                });
                this.notificationService.error(error);
                return;
            }
            this.notificationService.error(err);
        }
        getPagedModel(arg) {
            if (Array.isArray(arg)) {
                return new paging_1.PagedModel(arg);
            }
            const pager = {
                total: arg.total,
                pageSize: arg.pageSize,
                firstPage: arg.firstPage,
                getPage: (pageIndex, cancellationToken) => arg.getPage(pageIndex, cancellationToken)
            };
            return new paging_1.PagedModel(pager);
        }
        dispose() {
            super.dispose();
            if (this.queryRequest) {
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            this.list = null;
        }
        static isLocalExtensionsQuery(query) {
            return this.isInstalledExtensionsQuery(query)
                || this.isOutdatedExtensionsQuery(query)
                || this.isEnabledExtensionsQuery(query)
                || this.isDisabledExtensionsQuery(query)
                || this.isBuiltInExtensionsQuery(query)
                || this.isSearchBuiltInExtensionsQuery(query)
                || this.isBuiltInGroupExtensionsQuery(query)
                || this.isSearchTrustRequiredExtensionsQuery(query)
                || this.isTrustRequiredExtensionsQuery(query)
                || this.isTrustRequiredGroupExtensionsQuery(query);
        }
        static isSearchBuiltInExtensionsQuery(query) {
            return /@builtin\s.+/i.test(query);
        }
        static isBuiltInExtensionsQuery(query) {
            return /^\s*@builtin$/i.test(query.trim());
        }
        static isBuiltInGroupExtensionsQuery(query) {
            return /^\s*@builtin:.+$/i.test(query.trim());
        }
        static isSearchTrustRequiredExtensionsQuery(query) {
            return /@trustRequired\s.+/i.test(query);
        }
        static isTrustRequiredExtensionsQuery(query) {
            return /^\s*@trustRequired$/i.test(query.trim());
        }
        static isTrustRequiredGroupExtensionsQuery(query) {
            return /^\s*@trustRequired:.+$/i.test(query.trim());
        }
        static isInstalledExtensionsQuery(query) {
            return /@installed/i.test(query);
        }
        static isOutdatedExtensionsQuery(query) {
            return /@outdated/i.test(query);
        }
        static isEnabledExtensionsQuery(query) {
            return /@enabled/i.test(query);
        }
        static isDisabledExtensionsQuery(query) {
            return /@disabled/i.test(query);
        }
        static isRecommendedExtensionsQuery(query) {
            return /^@recommended$/i.test(query.trim());
        }
        static isSearchRecommendedExtensionsQuery(query) {
            return /@recommended\s.+/i.test(query);
        }
        static isWorkspaceRecommendedExtensionsQuery(query) {
            return /@recommended:workspace/i.test(query);
        }
        static isExeRecommendedExtensionsQuery(query) {
            return /@exe:.+/i.test(query);
        }
        static isKeymapsRecommendedExtensionsQuery(query) {
            return /@recommended:keymaps/i.test(query);
        }
        focus() {
            super.focus();
            if (!this.list) {
                return;
            }
            if (!(this.list.getFocus().length || this.list.getSelection().length)) {
                this.list.focusNext();
            }
            this.list.domFocus();
        }
    };
    ExtensionsListView = __decorate([
        __param(2, notification_1.INotificationService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, extensions_2.IExtensionService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, experimentService_1.IExperimentService),
        __param(14, extensionManagement_1.IExtensionManagementServerService),
        __param(15, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(16, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(17, productService_1.IProductService),
        __param(18, contextkey_1.IContextKeyService),
        __param(19, views_1.IViewDescriptorService),
        __param(20, opener_1.IOpenerService),
        __param(21, preferences_1.IPreferencesService),
        __param(22, storage_1.IStorageService)
    ], ExtensionsListView);
    exports.ExtensionsListView = ExtensionsListView;
    class ServerInstalledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@installed';
            if (!ExtensionsListView.isLocalExtensionsQuery(query)) {
                query = query += ' @installed';
            }
            return super.show(query.trim());
        }
    }
    exports.ServerInstalledExtensionsView = ServerInstalledExtensionsView;
    class EnabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@enabled';
            return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
        }
    }
    exports.EnabledExtensionsView = EnabledExtensionsView;
    class DisabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@disabled';
            return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
        }
    }
    exports.DisabledExtensionsView = DisabledExtensionsView;
    class BuiltInFeatureExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:features');
        }
    }
    exports.BuiltInFeatureExtensionsView = BuiltInFeatureExtensionsView;
    class BuiltInThemesExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:themes');
        }
    }
    exports.BuiltInThemesExtensionsView = BuiltInThemesExtensionsView;
    class BuiltInProgrammingLanguageExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:basics');
        }
    }
    exports.BuiltInProgrammingLanguageExtensionsView = BuiltInProgrammingLanguageExtensionsView;
    class TrustRequiredOnStartExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@trustRequired') ? this.showEmptyModel() : super.show('@trustRequired:onStart');
        }
    }
    exports.TrustRequiredOnStartExtensionsView = TrustRequiredOnStartExtensionsView;
    class TrustRequiredOnDemandExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@trustRequired') ? this.showEmptyModel() : super.show('@trustRequired:onDemand');
        }
    }
    exports.TrustRequiredOnDemandExtensionsView = TrustRequiredOnDemandExtensionsView;
    class DefaultRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:all';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            if (query && query.trim() !== this.recommendedExtensionsQuery) {
                return this.showEmptyModel();
            }
            const model = await super.show(this.recommendedExtensionsQuery);
            if (!this.extensionsWorkbenchService.local.some(e => !e.isBuiltin)) {
                // This is part of popular extensions view. Collapse if no installed extensions.
                this.setExpanded(model.length > 0);
            }
            return model;
        }
    }
    exports.DefaultRecommendedExtensionsView = DefaultRecommendedExtensionsView;
    class RecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            return (query && query.trim() !== this.recommendedExtensionsQuery) ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
        }
    }
    exports.RecommendedExtensionsView = RecommendedExtensionsView;
    class WorkspaceRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:workspace';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
        }
        async show(query) {
            let shouldShowEmptyView = query && query.trim() !== '@recommended' && query.trim() !== '@recommended:workspace';
            let model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
            this.setExpanded(model.length > 0);
            return model;
        }
        async getInstallableWorkspaceRecommendations() {
            const installed = (await this.extensionsWorkbenchService.queryLocal())
                .filter(l => l.enablementState !== 1 /* DisabledByExtensionKind */); // Filter extensions disabled by kind
            const recommendations = (await this.getWorkspaceRecommendations())
                .filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, local.identifier)));
            return this.getInstallableRecommendations(recommendations, { source: 'install-all-workspace-recommendations' }, cancellation_1.CancellationToken.None);
        }
        async installWorkspaceRecommendations() {
            const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
            if (installableRecommendations.length) {
                await this.extensionManagementService.installExtensions(installableRecommendations.map(i => i.gallery));
            }
            else {
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(7, null)
                });
            }
        }
    }
    exports.WorkspaceRecommendedExtensionsView = WorkspaceRecommendedExtensionsView;
});
//# sourceMappingURL=extensionsViews.js.map