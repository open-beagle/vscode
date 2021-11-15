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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/decorators", "vs/base/common/iterator", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/linkedText", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/workspace/browser/workspaceTrustEditor", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/opener/browser/link", "vs/platform/product/common/product", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspaces/common/workspaces", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/notifications", "vs/workbench/common/theme", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/workbench/contrib/workspace/browser/workspaceTrustColors", "vs/workbench/contrib/workspace/browser/workspaceTrustTree", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, dom_1, button_1, scrollableElement_1, actions_1, codicons_1, color_1, decorators_1, iterator_1, labels_1, lifecycle_1, linkedText_1, network_1, resources_1, types_1, uri_1, nls_1, contextView_1, dialogs_1, instantiation_1, notification_1, link_1, product_1, storage_1, telemetry_1, colorRegistry_1, styler_1, themeService_1, workspace_1, workspaceTrust_1, workspaces_1, editorPane_1, notifications_1, theme_1, extensions_1, extensionsUtils_1, workspaceTrustColors_1, workspaceTrustTree_1, configuration_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustEditor = void 0;
    const shieldIcon = (0, codicons_1.registerCodicon)('workspace-trust-icon', codicons_1.Codicon.shield);
    const checkListIcon = (0, codicons_1.registerCodicon)('workspace-trusted-check-icon', codicons_1.Codicon.check);
    const xListIcon = (0, codicons_1.registerCodicon)('workspace-trusted-x-icon', codicons_1.Codicon.x);
    let WorkspaceTrustEditor = class WorkspaceTrustEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, themeService, storageService, workspaceService, extensionWorkbenchService, extensionManifestPropertiesService, instantiationService, contextMenuService, dialogService, workspaceTrustManagementService, configurationService) {
            super(WorkspaceTrustEditor.ID, telemetryService, themeService, storageService);
            this.workspaceService = workspaceService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.dialogService = dialogService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.rendering = false;
            this.rerenderDisposables = this._register(new lifecycle_1.DisposableStore());
            this.layoutParticipants = [];
        }
        createEditor(parent) {
            this.rootElement = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-editor', { tabindex: '-1' }));
            this.createHeaderElement(this.rootElement);
            const scrollableContent = (0, dom_1.$)('.workspace-trust-editor-body');
            this.bodyScrollBar = this._register(new scrollableElement_1.DomScrollableElement(scrollableContent, {
                horizontal: 2 /* Hidden */,
                vertical: 3 /* Visible */,
            }));
            (0, dom_1.append)(this.rootElement, this.bodyScrollBar.getDomNode());
            this.createAffectedFeaturesElement(scrollableContent);
            this.createConfigurationElement(scrollableContent);
            this._register((0, styler_1.attachStylerCallback)(this.themeService, { ACTIVITY_BAR_BADGE_BACKGROUND: theme_1.ACTIVITY_BAR_BADGE_BACKGROUND, trustedForegroundColor: workspaceTrustColors_1.trustedForegroundColor, untrustedForegroundColor: workspaceTrustColors_1.untrustedForegroundColor }, colors => {
                var _a, _b, _c;
                this.rootElement.style.setProperty('--workspace-trust-trusted-color', ((_a = colors.trustedForegroundColor) === null || _a === void 0 ? void 0 : _a.toString()) || '');
                this.rootElement.style.setProperty('--workspace-trust-untrusted-color', ((_b = colors.untrustedForegroundColor) === null || _b === void 0 ? void 0 : _b.toString()) || '');
                this.rootElement.style.setProperty('--workspace-trust-selected-state-color', ((_c = colors.ACTIVITY_BAR_BADGE_BACKGROUND) === null || _c === void 0 ? void 0 : _c.toString()) || '');
            }));
            this._register((0, themeService_1.registerThemingParticipant)((theme, collector) => {
                const foregroundColor = theme.getColor(colorRegistry_1.foreground);
                if (foregroundColor) {
                    const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.3));
                    collector.addRule(`.workspace-trust-editor .workspace-trust-features .workspace-trust-limitations { border: 1px solid ${fgWithOpacity}; margin: 0px 4px; display: flex; flex-direction: column; padding: 10px 40px;}`);
                }
            }));
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            if (token.isCancellationRequested) {
                return;
            }
            this.registerListeners();
            this.render();
        }
        registerListeners() {
            this._register(this.extensionWorkbenchService.onChange(() => this.render()));
            this._register(this.configurationService.onDidChangeRestrictedSettings(() => this.render()));
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(() => this.render()));
            this._register(this.workspaceTrustManagementService.onDidChangeTrustedFolders(() => this.render()));
        }
        getHeaderContainerClass(trusted) {
            if (trusted) {
                return 'workspace-trust-header workspace-trust-trusted';
            }
            return 'workspace-trust-header workspace-trust-untrusted';
        }
        useWorkspaceLanguage() {
            return !(0, workspaces_1.isSingleFolderWorkspaceIdentifier)((0, workspaces_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace()));
        }
        getHeaderTitleText(trusted) {
            if (trusted) {
                return this.useWorkspaceLanguage() ? (0, nls_1.localize)(0, null) : (0, nls_1.localize)(1, null);
            }
            return this.useWorkspaceLanguage() ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null);
        }
        getHeaderDescriptionText(trusted) {
            if (trusted) {
                return (0, nls_1.localize)(4, null);
            }
            return (0, nls_1.localize)(5, null, product_1.default.nameShort);
        }
        getHeaderTitleIconClassNames(trusted) {
            return shieldIcon.classNamesArray;
        }
        async render() {
            if (this.rendering) {
                return;
            }
            this.rendering = true;
            this.rerenderDisposables.clear();
            const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
            this.rootElement.classList.toggle('trusted', isWorkspaceTrusted);
            this.rootElement.classList.toggle('untrusted', !isWorkspaceTrusted);
            // Header Section
            this.headerTitleText.innerText = this.getHeaderTitleText(isWorkspaceTrusted);
            this.headerTitleIcon.className = 'workspace-trust-title-icon';
            this.headerTitleIcon.classList.add(...this.getHeaderTitleIconClassNames(isWorkspaceTrusted));
            this.headerDescription.innerText = '';
            const linkedText = (0, linkedText_1.parseLinkedText)(this.getHeaderDescriptionText(isWorkspaceTrusted));
            const p = (0, dom_1.append)(this.headerDescription, (0, dom_1.$)('p'));
            for (const node of linkedText.nodes) {
                if (typeof node === 'string') {
                    (0, dom_1.append)(p, document.createTextNode(node));
                }
                else {
                    const link = this.instantiationService.createInstance(link_1.Link, node);
                    (0, dom_1.append)(p, link.el);
                    this.rerenderDisposables.add(link);
                    this.rerenderDisposables.add((0, styler_1.attachLinkStyler)(link, this.themeService));
                }
            }
            this.headerContainer.className = this.getHeaderContainerClass(isWorkspaceTrusted);
            // Settings
            const settingsRequiringTrustedWorkspaceCount = (0, configuration_1.filterSettingsRequireWorkspaceTrust)(this.configurationService.restrictedSettings.default).length;
            // Features List
            const installedExtensions = await this.instantiationService.invokeFunction(extensionsUtils_1.getInstalledExtensions);
            const onDemandExtensionCount = this.getExtensionCountByUntrustedWorkspaceSupport(installedExtensions, 'limited');
            const onStartExtensionCount = this.getExtensionCountByUntrustedWorkspaceSupport(installedExtensions, false);
            this.renderAffectedFeatures(settingsRequiringTrustedWorkspaceCount, onDemandExtensionCount + onStartExtensionCount);
            // Configuration Tree
            this.workspaceTrustSettingsTreeModel.update(this.workspaceTrustManagementService.getTrustedFolders());
            this.trustSettingsTree.setChildren(null, iterator_1.Iterable.map(this.workspaceTrustSettingsTreeModel.settings, s => { return { element: s }; }));
            this.bodyScrollBar.getDomNode().style.height = `calc(100% - ${this.headerContainer.clientHeight}px)`;
            this.bodyScrollBar.scanDomNode();
            this.rendering = false;
        }
        getExtensionCountByUntrustedWorkspaceSupport(extensions, trustRequestType) {
            const filtered = extensions.filter(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.local.manifest) === trustRequestType);
            const set = new Set();
            for (const ext of filtered) {
                set.add(ext.identifier.id);
            }
            return set.size;
        }
        createHeaderElement(parent) {
            this.headerContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-header'));
            this.headerTitleContainer = (0, dom_1.append)(this.headerContainer, (0, dom_1.$)('.workspace-trust-title'));
            this.headerTitleIcon = (0, dom_1.append)(this.headerTitleContainer, (0, dom_1.$)('.workspace-trust-title-icon'));
            this.headerTitleText = (0, dom_1.append)(this.headerTitleContainer, (0, dom_1.$)('.workspace-trust-title-text'));
            this.headerDescription = (0, dom_1.append)(this.headerContainer, (0, dom_1.$)('.workspace-trust-description'));
        }
        createConfigurationElement(parent) {
            this.configurationContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-settings.settings-editor'));
            const settingsBody = (0, dom_1.append)(this.configurationContainer, (0, dom_1.$)('.workspace-trust-settings-body.settings-body'));
            const workspaceTrustTreeContainer = (0, dom_1.append)(settingsBody, (0, dom_1.$)('.workspace-trust-settings-tree-container.settings-tree-container'));
            const renderer = this.instantiationService.createInstance(workspaceTrustTree_1.WorkspaceTrustSettingArrayRenderer);
            this.trustSettingsTree = this._register(this.instantiationService.createInstance(workspaceTrustTree_1.WorkspaceTrustTree, workspaceTrustTreeContainer, [renderer]));
            this.workspaceTrustSettingsTreeModel = this.instantiationService.createInstance(workspaceTrustTree_1.WorkspaceTrustTreeModel);
            this._register(renderer.onDidChangeSetting(e => this.onDidChangeSetting(e)));
        }
        createAffectedFeaturesElement(parent) {
            this.affectedFeaturesContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-features'));
        }
        renderAffectedFeatures(numSettings, numExtensions) {
            (0, dom_1.clearNode)(this.affectedFeaturesContainer);
            const trustedContainer = (0, dom_1.append)(this.affectedFeaturesContainer, (0, dom_1.$)('.workspace-trust-limitations.trusted'));
            this.renderLimitationsHeaderElement(trustedContainer, this.useWorkspaceLanguage() ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null), this.useWorkspaceLanguage() ? (0, nls_1.localize)(8, null) : (0, nls_1.localize)(9, null));
            this.renderLimitationsListElement(trustedContainer, [
                (0, nls_1.localize)(10, null),
                (0, nls_1.localize)(11, null),
                (0, nls_1.localize)(12, null),
                (0, nls_1.localize)(13, null)
            ], checkListIcon.classNamesArray);
            const untrustedContainer = (0, dom_1.append)(this.affectedFeaturesContainer, (0, dom_1.$)('.workspace-trust-limitations.untrusted'));
            this.renderLimitationsHeaderElement(untrustedContainer, (0, nls_1.localize)(14, null), this.useWorkspaceLanguage() ? (0, nls_1.localize)(15, null) : (0, nls_1.localize)(16, null));
            this.renderLimitationsListElement(untrustedContainer, [
                (0, nls_1.localize)(17, null),
                (0, nls_1.localize)(18, null),
                numSettings ? (0, nls_1.localize)(19, null, numSettings, 'settings.filterUntrusted') : (0, nls_1.localize)(20, null),
                (0, nls_1.localize)(21, null, numExtensions, 'workbench.extensions.action.listTrustRequiredExtensions')
            ], xListIcon.classNamesArray);
            if (!this.workspaceTrustManagementService.isWorkpaceTrusted()) {
                this.addTrustButtonToElement(trustedContainer);
            }
            if (this.isTrustedExplicitlyOnly()) {
                this.addDontTrustButtonToElement(untrustedContainer);
            }
            else {
                this.addTrustedTextToElement(untrustedContainer);
            }
        }
        isTrustedExplicitlyOnly() {
            // Can only be trusted explicitly in the single folder scenario
            const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace());
            if (!((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier) && workspaceIdentifier.uri.scheme === network_1.Schemas.file)) {
                return false;
            }
            // If the current folder isn't trusted directly, return false
            const trustInfo = this.workspaceTrustManagementService.getFolderTrustInfo(workspaceIdentifier.uri);
            if (!trustInfo.trusted || !(0, resources_1.isEqual)(workspaceIdentifier.uri, trustInfo.uri)) {
                return false;
            }
            // Check if the parent is also trusted
            if (this.workspaceTrustManagementService.canSetParentFolderTrust()) {
                const { parentPath } = (0, labels_1.splitName)(workspaceIdentifier.uri.fsPath);
                const parentIsTrusted = this.workspaceTrustManagementService.getFolderTrustInfo(uri_1.URI.file(parentPath)).trusted;
                if (parentIsTrusted) {
                    return false;
                }
            }
            return true;
        }
        createButton(parent, action, enabled) {
            var _a, _b;
            const buttonRow = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-buttons-row'));
            const buttonContainer = (0, dom_1.append)(buttonRow, (0, dom_1.$)('.workspace-trust-buttons'));
            const buttonBar = this.rerenderDisposables.add(new button_1.ButtonBar(buttonContainer));
            const button = action instanceof notifications_1.ChoiceAction && ((_a = action.menu) === null || _a === void 0 ? void 0 : _a.length) ?
                buttonBar.addButtonWithDropdown({
                    title: true,
                    actions: (_b = action.menu) !== null && _b !== void 0 ? _b : [],
                    contextMenuProvider: this.contextMenuService
                }) :
                buttonBar.addButton();
            button.label = action.label;
            button.enabled = enabled !== undefined ? enabled : action.enabled;
            this.rerenderDisposables.add(button.onDidClick(e => {
                if (e) {
                    dom_1.EventHelper.stop(e, true);
                }
                action.run();
            }));
            this.rerenderDisposables.add((0, styler_1.attachButtonStyler)(button, this.themeService));
        }
        addTrustButtonToElement(parent) {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust()) {
                const trustUris = async (uris) => {
                    if (!uris) {
                        this.workspaceTrustManagementService.setWorkspaceTrust(true);
                    }
                    else {
                        this.workspaceTrustManagementService.setFoldersTrust(uris, true);
                    }
                };
                const trustChoiceWithMenu = {
                    isSecondary: false,
                    label: (0, nls_1.localize)(22, null),
                    menu: [],
                    run: () => {
                        trustUris();
                    }
                };
                const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace());
                if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier) && workspaceIdentifier.uri.scheme === network_1.Schemas.file) {
                    const { parentPath } = (0, labels_1.splitName)(workspaceIdentifier.uri.fsPath);
                    if (parentPath) {
                        trustChoiceWithMenu.menu.push({
                            label: (0, nls_1.localize)(23, null),
                            run: () => {
                                trustUris([uri_1.URI.file(parentPath)]);
                            }
                        });
                    }
                }
                const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
                this.createButton(parent, new notifications_1.ChoiceAction('workspace.trust.button.action', trustChoiceWithMenu), !isWorkspaceTrusted);
            }
        }
        addDontTrustButtonToElement(parent) {
            if (this.workspaceTrustManagementService.canSetWorkspaceTrust() && this.isTrustedExplicitlyOnly()) {
                this.createButton(parent, new actions_1.Action('workspace.trust.button.action.deny', (0, nls_1.localize)(24, null), undefined, true, async () => {
                    await this.workspaceTrustManagementService.setWorkspaceTrust(false);
                }));
            }
        }
        addTrustedTextToElement(parent) {
            const isWorkspaceTrusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
            const canSetWorkspaceTrust = this.workspaceTrustManagementService.canSetWorkspaceTrust();
            if (canSetWorkspaceTrust && isWorkspaceTrusted) {
                const textElement = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-untrusted-description'));
                textElement.innerText = this.useWorkspaceLanguage() ? (0, nls_1.localize)(25, null) : (0, nls_1.localize)(26, null);
            }
        }
        renderLimitationsHeaderElement(parent, headerText, subtitleText) {
            const limitationsHeaderContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-limitations-header'));
            const titleElement = (0, dom_1.append)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-title'));
            const textElement = (0, dom_1.append)(titleElement, (0, dom_1.$)('.workspace-trust-limitations-title-text'));
            const subtitleElement = (0, dom_1.append)(limitationsHeaderContainer, (0, dom_1.$)('.workspace-trust-limitations-subtitle'));
            textElement.innerText = headerText;
            subtitleElement.innerText = subtitleText;
        }
        renderLimitationsListElement(parent, limitations, iconClassNames) {
            const listContainer = (0, dom_1.append)(parent, (0, dom_1.$)('.workspace-trust-limitations-list-container'));
            const limitationsList = (0, dom_1.append)(listContainer, (0, dom_1.$)('ul'));
            for (const limitation of limitations) {
                const limitationListItem = (0, dom_1.append)(limitationsList, (0, dom_1.$)('li'));
                const icon = (0, dom_1.append)(limitationListItem, (0, dom_1.$)('.list-item-icon'));
                const text = (0, dom_1.append)(limitationListItem, (0, dom_1.$)('.list-item-text'));
                icon.classList.add(...iconClassNames);
                const linkedText = (0, linkedText_1.parseLinkedText)(limitation);
                for (const node of linkedText.nodes) {
                    if (typeof node === 'string') {
                        (0, dom_1.append)(text, document.createTextNode(node));
                    }
                    else {
                        const link = this.instantiationService.createInstance(link_1.Link, node);
                        (0, dom_1.append)(text, link.el);
                        this.rerenderDisposables.add(link);
                        this.rerenderDisposables.add((0, styler_1.attachLinkStyler)(link, this.themeService));
                    }
                }
            }
        }
        onDidChangeSetting(change) {
            const applyChangesWithPrompt = async (showPrompt, applyChanges) => {
                if (showPrompt) {
                    const message = (0, nls_1.localize)(27, null);
                    const detail = (0, nls_1.localize)(28, null);
                    const primaryButton = (0, nls_1.localize)(29, null);
                    const secondaryButton = (0, nls_1.localize)(30, null);
                    const result = await this.dialogService.show(notification_1.Severity.Info, message, [primaryButton, secondaryButton], { cancelId: 1, detail, custom: { icon: codicons_1.Codicon.shield } });
                    if (result.choice !== 0) {
                        return;
                    }
                }
                applyChanges();
            };
            if ((0, types_1.isArray)(change.value)) {
                if (change.key === 'trustedFolders') {
                    applyChangesWithPrompt(false, () => this.workspaceTrustManagementService.setTrustedFolders(change.value));
                }
            }
        }
        layout(dimension) {
            if (!this.isVisible()) {
                return;
            }
            this.trustSettingsTree.layout(dimension.height, dimension.width);
            this.layoutParticipants.forEach(participant => {
                participant.layout();
            });
            this.bodyScrollBar.scanDomNode();
        }
    };
    WorkspaceTrustEditor.ID = 'workbench.editor.workspaceTrust';
    __decorate([
        (0, decorators_1.debounce)(100)
    ], WorkspaceTrustEditor.prototype, "render", null);
    WorkspaceTrustEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, storage_1.IStorageService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, extensions_1.IExtensionsWorkbenchService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, dialogs_1.IDialogService),
        __param(9, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(10, configuration_1.IWorkbenchConfigurationService)
    ], WorkspaceTrustEditor);
    exports.WorkspaceTrustEditor = WorkspaceTrustEditor;
});
//# sourceMappingURL=workspaceTrustEditor.js.map