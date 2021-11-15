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
define(["require", "exports", "vs/platform/instantiation/common/descriptors", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/workspace/browser/workspace.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/contributions", "vs/base/common/codicons", "vs/workbench/api/common/extHostTypes", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/workbench/services/statusbar/common/statusbar", "vs/workbench/browser/editor", "vs/workbench/contrib/workspace/browser/workspaceTrustEditor", "vs/workbench/services/workspaces/browser/workspaceTrustEditorInput", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions", "vs/base/common/platform", "vs/platform/contextkey/common/contextkeys", "vs/base/common/path", "vs/platform/configuration/common/configuration", "vs/platform/product/common/product", "vs/base/common/htmlContent", "vs/platform/workspaces/common/workspaces", "vs/base/common/network", "vs/workbench/common/theme", "vs/platform/storage/common/storage", "vs/css!./workspaceTrustEditor"], function (require, exports, descriptors_1, lifecycle_1, nls_1, actions_1, configurationRegistry_1, dialogs_1, instantiation_1, notification_1, platform_1, workspaceTrust_1, contributions_1, codicons_1, extHostTypes_1, editorService_1, contextkey_1, commands_1, statusbar_1, editor_1, workspaceTrustEditor_1, workspaceTrustEditorInput_1, workspaceTrust_2, editor_2, telemetry_1, workspace_1, extensions_1, platform_2, contextkeys_1, path_1, configuration_1, product_1, htmlContent_1, workspaces_1, network_1, theme_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustRequestHandler = void 0;
    const STARTUP_PROMPT_SHOWN_KEY = 'workspace.trust.startupPrompt.shown';
    /*
     * Trust Request UX Handler
     */
    let WorkspaceTrustRequestHandler = class WorkspaceTrustRequestHandler extends lifecycle_1.Disposable {
        constructor(dialogService, commandService, workspaceContextService, workspaceTrustManagementService, configurationService, storageService, workspaceTrustRequestService) {
            super();
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.configurationService = configurationService;
            this.storageService = storageService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            if ((0, workspaceTrust_2.isWorkspaceTrustEnabled)(configurationService)) {
                this.registerListeners();
                this.showModalOnStart();
            }
        }
        get startupPromptSetting() {
            return this.configurationService.getValue(workspaceTrust_2.WORKSPACE_TRUST_STARTUP_PROMPT);
        }
        get useWorkspaceLanguage() {
            return !(0, workspaces_1.isSingleFolderWorkspaceIdentifier)((0, workspaces_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace()));
        }
        get modalTitle() {
            return this.useWorkspaceLanguage ?
                (0, nls_1.localize)(0, null) :
                (0, nls_1.localize)(1, null);
        }
        async doShowModal(question, trustedOption, untrustedOption, markdownStrings, trustParentString) {
            const result = await this.dialogService.show(notification_1.Severity.Info, question, [
                trustedOption.label,
                untrustedOption.label,
            ], {
                checkbox: trustParentString ? {
                    label: trustParentString
                } : undefined,
                custom: {
                    buttonDetails: [
                        trustedOption.sublabel,
                        untrustedOption.sublabel
                    ],
                    disableCloseAction: true,
                    icon: codicons_1.Codicon.shield,
                    markdownDetails: markdownStrings.map(md => { return { markdown: new htmlContent_1.MarkdownString(md) }; })
                },
            });
            // Dialog result
            switch (result.choice) {
                case 0:
                    if (result.checkboxChecked) {
                        this.workspaceTrustManagementService.setParentFolderTrust(true);
                    }
                    else {
                        this.workspaceTrustRequestService.completeRequest(true);
                    }
                    break;
                case 1:
                    this.workspaceTrustRequestService.cancelRequest();
                    break;
            }
            this.storageService.store(STARTUP_PROMPT_SHOWN_KEY, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
        }
        showModalOnStart() {
            if (this.workspaceTrustManagementService.isWorkpaceTrusted()) {
                return;
            }
            if (this.startupPromptSetting === 'never') {
                return;
            }
            if (this.startupPromptSetting === 'once' && this.storageService.getBoolean(STARTUP_PROMPT_SHOWN_KEY, 1 /* WORKSPACE */, false)) {
                return;
            }
            let checkboxText;
            const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this.workspaceContextService.getWorkspace());
            const isSingleFolderWorkspace = (0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier);
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier) && workspaceIdentifier.uri.scheme === network_1.Schemas.file) {
                checkboxText = (0, nls_1.localize)(2, null);
            }
            // Show Workspace Trust Start Dialog
            this.doShowModal(this.modalTitle, { label: (0, nls_1.localize)(3, null), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)(4, null) : (0, nls_1.localize)(5, null) }, { label: (0, nls_1.localize)(6, null), sublabel: isSingleFolderWorkspace ? (0, nls_1.localize)(7, null) : (0, nls_1.localize)(8, null) }, [
                !isSingleFolderWorkspace ?
                    (0, nls_1.localize)(9, null, product_1.default.nameShort) :
                    (0, nls_1.localize)(10, null, product_1.default.nameShort),
                (0, nls_1.localize)(11, null)
            ], checkboxText);
        }
        registerListeners() {
            this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(async (requestOptions) => {
                var _a, _b;
                if (requestOptions.modal) {
                    // Message
                    const defaultMessage = (0, nls_1.localize)(12, null);
                    const message = (_a = requestOptions.message) !== null && _a !== void 0 ? _a : defaultMessage;
                    // Buttons
                    const buttons = (_b = requestOptions.buttons) !== null && _b !== void 0 ? _b : [
                        { label: this.useWorkspaceLanguage ? (0, nls_1.localize)(13, null) : (0, nls_1.localize)(14, null), type: 'ContinueWithTrust' },
                        { label: (0, nls_1.localize)(15, null), type: 'Manage' }
                    ];
                    // Add Cancel button if not provided
                    if (!buttons.some(b => b.type === 'Cancel')) {
                        buttons.push({ label: (0, nls_1.localize)(16, null), type: 'Cancel' });
                    }
                    // Dialog
                    const result = await this.dialogService.show(notification_1.Severity.Info, this.modalTitle, buttons.map(b => b.label), {
                        cancelId: buttons.findIndex(b => b.type === 'Cancel'),
                        custom: {
                            icon: codicons_1.Codicon.shield,
                            markdownDetails: [
                                { markdown: new htmlContent_1.MarkdownString(message) },
                                { markdown: new htmlContent_1.MarkdownString((0, nls_1.localize)(17, null)) }
                            ]
                        }
                    });
                    // Dialog result
                    switch (buttons[result.choice].type) {
                        case 'ContinueWithTrust':
                            this.workspaceTrustRequestService.completeRequest(true);
                            break;
                        case 'ContinueWithoutTrust':
                            this.workspaceTrustRequestService.completeRequest(undefined);
                            break;
                        case 'Manage':
                            this.workspaceTrustRequestService.cancelRequest();
                            await this.commandService.executeCommand('workbench.trust.manage');
                            break;
                        case 'Cancel':
                            this.workspaceTrustRequestService.cancelRequest();
                            break;
                    }
                }
            }));
            this._register(this.workspaceContextService.onWillChangeWorkspaceFolders(e => {
                if (e.fromCache) {
                    return;
                }
                if (!(0, workspaceTrust_2.isWorkspaceTrustEnabled)(this.configurationService)) {
                    return;
                }
                const trusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
                return e.join(new Promise(async (resolve) => {
                    // Workspace is trusted and there are added/changed folders
                    if (trusted && (e.changes.added.length || e.changes.changed.length)) {
                        const addedFoldersTrustInfo = e.changes.added.map(folder => this.workspaceTrustManagementService.getFolderTrustInfo(folder.uri));
                        if (!addedFoldersTrustInfo.map(i => i.trusted).every(trusted => trusted)) {
                            const result = await this.dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(18, null), [(0, nls_1.localize)(19, null), (0, nls_1.localize)(20, null)], {
                                detail: (0, nls_1.localize)(21, null),
                                cancelId: 1,
                                custom: { icon: codicons_1.Codicon.shield }
                            });
                            // Mark added/changed folders as trusted
                            this.workspaceTrustManagementService.setFoldersTrust(addedFoldersTrustInfo.map(i => i.uri), result.choice === 0);
                            resolve();
                        }
                    }
                    resolve();
                }));
            }));
        }
    };
    WorkspaceTrustRequestHandler = __decorate([
        __param(0, dialogs_1.IDialogService),
        __param(1, commands_1.ICommandService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, storage_1.IStorageService),
        __param(6, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], WorkspaceTrustRequestHandler);
    exports.WorkspaceTrustRequestHandler = WorkspaceTrustRequestHandler;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspaceTrustRequestHandler, 2 /* Ready */);
    /*
     * Status Bar Entry
     */
    let WorkspaceTrustStatusbarItem = class WorkspaceTrustStatusbarItem extends lifecycle_1.Disposable {
        constructor(configurationService, statusbarService, workspaceTrustManagementService, workspaceService, contextKeyService) {
            super();
            this.statusbarService = statusbarService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceService = workspaceService;
            this.contextKeyService = contextKeyService;
            this.entryId = `status.workspaceTrust.${this.workspaceService.getWorkspace().id}`;
            this.pendingRequestContextKey = workspaceTrust_2.WorkspaceTrustContext.PendingRequest.key;
            this.contextKeys = new Set([this.pendingRequestContextKey]);
            this.statusBarEntryAccessor = this._register(new lifecycle_1.MutableDisposable());
            if ((0, workspaceTrust_2.isWorkspaceTrustEnabled)(configurationService)) {
                const entry = this.getStatusbarEntry(this.workspaceTrustManagementService.isWorkpaceTrusted());
                this.statusBarEntryAccessor.value = this.statusbarService.addEntry(entry, this.entryId, (0, nls_1.localize)(22, null), 0 /* LEFT */, 0.99 * Number.MAX_VALUE /* Right of remote indicator */);
                this._register(this.workspaceTrustManagementService.onDidChangeTrust(trusted => this.updateStatusbarEntry(trusted)));
                this._register(this.contextKeyService.onDidChangeContext((contextChange) => {
                    if (contextChange.affectsSome(this.contextKeys)) {
                        this.updateVisibility(this.workspaceTrustManagementService.isWorkpaceTrusted());
                    }
                }));
                this.updateVisibility(this.workspaceTrustManagementService.isWorkpaceTrusted());
            }
        }
        getStatusbarEntry(trusted) {
            const text = (0, workspaceTrust_1.workspaceTrustToString)(trusted);
            const backgroundColor = new extHostTypes_1.ThemeColor(theme_1.STATUS_BAR_PROMINENT_ITEM_BACKGROUND);
            const color = new extHostTypes_1.ThemeColor(theme_1.STATUS_BAR_PROMINENT_ITEM_FOREGROUND);
            return {
                text: trusted ? `$(shield)` : `$(shield) ${text}`,
                ariaLabel: trusted ? (0, nls_1.localize)(23, null) : (0, nls_1.localize)(24, null),
                tooltip: trusted ? (0, nls_1.localize)(25, null) : (0, nls_1.localize)(26, null),
                command: 'workbench.trust.manage',
                backgroundColor,
                color
            };
        }
        updateVisibility(trusted) {
            const pendingRequest = this.contextKeyService.getContextKeyValue(this.pendingRequestContextKey) === true;
            this.statusbarService.updateEntryVisibility(this.entryId, !trusted || pendingRequest);
        }
        updateStatusbarEntry(trusted) {
            var _a;
            (_a = this.statusBarEntryAccessor.value) === null || _a === void 0 ? void 0 : _a.update(this.getStatusbarEntry(trusted));
            this.updateVisibility(trusted);
        }
    };
    WorkspaceTrustStatusbarItem = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, contextkey_1.IContextKeyService)
    ], WorkspaceTrustStatusbarItem);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspaceTrustStatusbarItem, 1 /* Starting */);
    /**
     * Trusted Workspace GUI Editor
     */
    class WorkspaceTrustEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return '{}';
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput);
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories)
        .registerEditorInputSerializer(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput.ID, WorkspaceTrustEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(workspaceTrustEditor_1.WorkspaceTrustEditor, workspaceTrustEditor_1.WorkspaceTrustEditor.ID, (0, nls_1.localize)(27, null)), [
        new descriptors_1.SyncDescriptor(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput)
    ]);
    /*
     * Actions
     */
    // Manage Workspace Trust
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.trust.manage',
                title: {
                    original: 'Manage Workspace Trust',
                    value: (0, nls_1.localize)(28, null)
                },
                category: (0, nls_1.localize)(29, null),
                menu: {
                    id: actions_1.MenuId.GlobalActivity,
                    group: '6_workspace_trust',
                    order: 40,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsWebContext.negate(), contextkey_1.ContextKeyExpr.equals(`config.${workspaceTrust_2.WORKSPACE_TRUST_ENABLED}`, true), workspaceTrust_2.WorkspaceTrustContext.PendingRequest.negate())
                },
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const input = instantiationService.createInstance(workspaceTrustEditorInput_1.WorkspaceTrustEditorInput);
            editorService.openEditor(input, { pinned: true, revealIfOpened: true });
            return;
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
        command: {
            id: 'workbench.trust.manage',
            title: (0, nls_1.localize)(30, null),
        },
        group: '6_workspace_trust',
        order: 40,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsWebContext.negate(), contextkey_1.ContextKeyExpr.equals(`config.${workspaceTrust_2.WORKSPACE_TRUST_ENABLED}`, true), workspaceTrust_2.WorkspaceTrustContext.PendingRequest)
    });
    /*
     * Configuration
     */
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'security',
        scope: 1 /* APPLICATION */,
        title: (0, nls_1.localize)(31, null),
        type: 'object',
        order: 7,
        properties: {
            [workspaceTrust_2.WORKSPACE_TRUST_ENABLED]: {
                type: 'boolean',
                default: false,
                included: !platform_2.isWeb,
                description: (0, nls_1.localize)(32, null),
                scope: 1 /* APPLICATION */
            },
            [workspaceTrust_2.WORKSPACE_TRUST_STARTUP_PROMPT]: {
                type: 'string',
                default: 'once',
                included: !platform_2.isWeb,
                description: (0, nls_1.localize)(33, null),
                scope: 1 /* APPLICATION */,
                enum: ['always', 'once', 'never'],
                enumDescriptions: [
                    (0, nls_1.localize)(34, null),
                    (0, nls_1.localize)(35, null),
                    (0, nls_1.localize)(36, null),
                ]
            }
        }
    });
    /**
     * Telemetry
     */
    let WorkspaceTrustTelemetryContribution = class WorkspaceTrustTelemetryContribution extends lifecycle_1.Disposable {
        constructor(configurationService, extensionService, telemetryService, workspaceContextService, workspaceTrustManagementService, workspaceTrustRequestService) {
            super();
            this.configurationService = configurationService;
            this.extensionService = extensionService;
            this.telemetryService = telemetryService;
            this.workspaceContextService = workspaceContextService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(isTrusted => this.logWorkspaceTrustChangeEvent(isTrusted)));
            this._register(this.workspaceTrustRequestService.onDidInitiateWorkspaceTrustRequest(options => this.logWorkspaceTrustRequest(options)));
            this.logInitialWorkspaceTrustInfo();
        }
        logInitialWorkspaceTrustInfo() {
            if (!(0, workspaceTrust_2.isWorkspaceTrustEnabled)(this.configurationService)) {
                return;
            }
            this.telemetryService.publicLog2('workspaceTrustFolderCounts', {
                trustedFoldersCount: this.workspaceTrustManagementService.getTrustedFolders().length,
            });
        }
        logWorkspaceTrustChangeEvent(isTrusted) {
            if (!(0, workspaceTrust_2.isWorkspaceTrustEnabled)(this.configurationService)) {
                return;
            }
            this.telemetryService.publicLog2('workspaceTrustStateChanged', {
                workspaceId: this.workspaceContextService.getWorkspace().id,
                isTrusted: isTrusted
            });
            if (isTrusted) {
                const getDepth = (folder) => {
                    let resolvedPath = (0, path_1.resolve)(folder);
                    let depth = 0;
                    while ((0, path_1.dirname)(resolvedPath) !== resolvedPath && depth < 100) {
                        resolvedPath = (0, path_1.dirname)(resolvedPath);
                        depth++;
                    }
                    return depth;
                };
                for (const folder of this.workspaceContextService.getWorkspace().folders) {
                    const { trusted, uri } = this.workspaceTrustManagementService.getFolderTrustInfo(folder.uri);
                    if (!trusted) {
                        continue;
                    }
                    const workspaceFolderDepth = getDepth(folder.uri.fsPath);
                    const trustedFolderDepth = getDepth(uri.fsPath);
                    const delta = workspaceFolderDepth - trustedFolderDepth;
                    this.telemetryService.publicLog2('workspaceFolderDepthBelowTrustedFolder', { workspaceFolderDepth, trustedFolderDepth, delta });
                }
            }
        }
        async logWorkspaceTrustRequest(options) {
            if (!(0, workspaceTrust_2.isWorkspaceTrustEnabled)(this.configurationService)) {
                return;
            }
            this.telemetryService.publicLog2('workspaceTrustRequested', {
                modal: options.modal,
                workspaceId: this.workspaceContextService.getWorkspace().id,
                extensions: (await this.extensionService.getExtensions()).filter(ext => { var _a; return !!((_a = ext.capabilities) === null || _a === void 0 ? void 0 : _a.untrustedWorkspaces); }).map(ext => ext.identifier.value)
            });
        }
    };
    WorkspaceTrustTelemetryContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(5, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], WorkspaceTrustTelemetryContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkspaceTrustTelemetryContribution, 3 /* Restored */);
});
//# sourceMappingURL=workspace.contribution.js.map