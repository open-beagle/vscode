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
define(["require", "exports", "vs/workbench/common/views", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSyncMergesView", "vs/workbench/browser/parts/views/treeView", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSync", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/base/common/uri", "vs/workbench/services/editor/common/editorService", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/codicons", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/resources", "vs/workbench/services/decorations/browser/decorations", "vs/platform/progress/common/progress", "vs/platform/theme/common/colorRegistry", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/styler", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/browser/codeeditor", "vs/editor/browser/editorExtensions", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/css!./media/userDataSyncViews"], function (require, exports, views_1, nls_1, treeView_1, instantiation_1, userDataSync_1, actions_1, contextkey_1, uri_1, editorService_1, event_1, lifecycle_1, codicons_1, userDataSync_2, resources_1, decorations_1, progress_1, colorRegistry_1, DOM, button_1, keybinding_1, contextView_1, configuration_1, opener_1, themeService_1, telemetry_1, styler_1, diffEditorInput_1, codeeditor_1, editorExtensions_1, notification_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncMergesViewPane = void 0;
    let UserDataSyncMergesViewPane = class UserDataSyncMergesViewPane extends treeView_1.TreeViewPane {
        constructor(options, editorService, dialogService, progressService, userDataSyncWorkbenchService, decorationsService, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.editorService = editorService;
            this.dialogService = dialogService;
            this.progressService = progressService;
            this.treeItems = new Map();
            this.userDataSyncPreview = userDataSyncWorkbenchService.userDataSyncPreview;
            this._register(this.userDataSyncPreview.onDidChangeResources(() => this.updateSyncButtonEnablement()));
            this._register(this.userDataSyncPreview.onDidChangeResources(() => this.treeView.refresh()));
            this._register(this.userDataSyncPreview.onDidChangeResources(() => this.closeDiffEditors()));
            this._register(decorationsService.registerDecorationsProvider(this._register(new UserDataSyncResourcesDecorationProvider(this.userDataSyncPreview))));
            this.registerActions();
        }
        renderTreeView(container) {
            super.renderTreeView(DOM.append(container, DOM.$('')));
            this.createButtons(container);
            const that = this;
            this.treeView.message = (0, nls_1.localize)(0, null);
            this.treeView.dataProvider = { getChildren() { return that.getTreeItems(); } };
        }
        createButtons(container) {
            this.buttonsContainer = DOM.append(container, DOM.$('.manual-sync-buttons-container'));
            this.syncButton = this._register(new button_1.Button(this.buttonsContainer));
            this.syncButton.label = (0, nls_1.localize)(1, null);
            this.updateSyncButtonEnablement();
            this._register((0, styler_1.attachButtonStyler)(this.syncButton, this.themeService));
            this._register(this.syncButton.onDidClick(() => this.apply()));
            this.cancelButton = this._register(new button_1.Button(this.buttonsContainer, { secondary: true }));
            this.cancelButton.label = (0, nls_1.localize)(2, null);
            this._register((0, styler_1.attachButtonStyler)(this.cancelButton, this.themeService));
            this._register(this.cancelButton.onDidClick(() => this.cancel()));
        }
        layoutTreeView(height, width) {
            const buttonContainerHeight = 78;
            this.buttonsContainer.style.height = `${buttonContainerHeight}px`;
            this.buttonsContainer.style.width = `${width}px`;
            const numberOfChanges = this.userDataSyncPreview.resources.filter(r => r.syncResource !== "globalState" /* GlobalState */ && (r.localChange !== 0 /* None */ || r.remoteChange !== 0 /* None */)).length;
            const messageHeight = 44;
            super.layoutTreeView(Math.min(height - buttonContainerHeight, ((22 * numberOfChanges) + messageHeight)), width);
        }
        updateSyncButtonEnablement() {
            this.syncButton.enabled = this.userDataSyncPreview.resources.every(c => c.syncResource === "globalState" /* GlobalState */ || c.mergeState === "accepted" /* Accepted */);
        }
        async getTreeItems() {
            this.treeItems.clear();
            const roots = [];
            for (const resource of this.userDataSyncPreview.resources) {
                if (resource.syncResource !== "globalState" /* GlobalState */ && (resource.localChange !== 0 /* None */ || resource.remoteChange !== 0 /* None */)) {
                    const handle = JSON.stringify(resource);
                    const treeItem = {
                        handle,
                        resourceUri: resource.remote,
                        label: { label: (0, resources_1.basename)(resource.remote), strikethrough: resource.mergeState === "accepted" /* Accepted */ && (resource.localChange === 3 /* Deleted */ || resource.remoteChange === 3 /* Deleted */) },
                        description: (0, userDataSync_2.getSyncAreaLabel)(resource.syncResource),
                        collapsibleState: views_1.TreeItemCollapsibleState.None,
                        command: { id: `workbench.actions.sync.showChanges`, title: '', arguments: [{ $treeViewId: '', $treeItemHandle: handle }] },
                        contextValue: `sync-resource-${resource.mergeState}`
                    };
                    this.treeItems.set(handle, treeItem);
                    roots.push(treeItem);
                }
            }
            return roots;
        }
        toUserDataSyncResourceGroup(handle) {
            const parsed = JSON.parse(handle);
            return {
                syncResource: parsed.syncResource,
                local: uri_1.URI.revive(parsed.local),
                remote: uri_1.URI.revive(parsed.remote),
                merged: uri_1.URI.revive(parsed.merged),
                accepted: uri_1.URI.revive(parsed.accepted),
                localChange: parsed.localChange,
                remoteChange: parsed.remoteChange,
                mergeState: parsed.mergeState,
            };
        }
        registerActions() {
            const that = this;
            /* accept remote change */
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptRemote`,
                        title: (0, nls_1.localize)(3, null),
                        icon: codicons_1.Codicon.cloudDownload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', userDataSync_2.SYNC_MERGES_VIEW_ID), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-resource-preview')),
                            group: 'inline',
                            order: 1,
                        },
                    });
                }
                async run(accessor, handle) {
                    return that.acceptRemote(that.toUserDataSyncResourceGroup(handle.$treeItemHandle));
                }
            }));
            /* accept local change */
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.acceptLocal`,
                        title: (0, nls_1.localize)(4, null),
                        icon: codicons_1.Codicon.cloudUpload,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', userDataSync_2.SYNC_MERGES_VIEW_ID), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-resource-preview')),
                            group: 'inline',
                            order: 2,
                        },
                    });
                }
                async run(accessor, handle) {
                    return that.acceptLocal(that.toUserDataSyncResourceGroup(handle.$treeItemHandle));
                }
            }));
            /* merge */
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.merge`,
                        title: (0, nls_1.localize)(5, null),
                        icon: codicons_1.Codicon.merge,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', userDataSync_2.SYNC_MERGES_VIEW_ID), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-resource-preview')),
                            group: 'inline',
                            order: 3,
                        },
                    });
                }
                async run(accessor, handle) {
                    return that.mergeResource(that.toUserDataSyncResourceGroup(handle.$treeItemHandle));
                }
            }));
            /* discard */
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.undo`,
                        title: (0, nls_1.localize)(6, null),
                        icon: codicons_1.Codicon.discard,
                        menu: {
                            id: actions_1.MenuId.ViewItemContext,
                            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', userDataSync_2.SYNC_MERGES_VIEW_ID), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-resource-accepted'), contextkey_1.ContextKeyExpr.equals('viewItem', 'sync-resource-conflict'))),
                            group: 'inline',
                            order: 3,
                        },
                    });
                }
                async run(accessor, handle) {
                    return that.discardResource(that.toUserDataSyncResourceGroup(handle.$treeItemHandle));
                }
            }));
            this._register((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `workbench.actions.sync.showChanges`,
                        title: (0, nls_1.localize)(7, null),
                    });
                }
                async run(accessor, handle) {
                    const previewResource = that.toUserDataSyncResourceGroup(handle.$treeItemHandle);
                    return that.open(previewResource);
                }
            }));
        }
        async acceptLocal(userDataSyncResource) {
            await this.withProgress(async () => {
                await this.userDataSyncPreview.accept(userDataSyncResource.syncResource, userDataSyncResource.local);
            });
            await this.reopen(userDataSyncResource);
        }
        async acceptRemote(userDataSyncResource) {
            await this.withProgress(async () => {
                await this.userDataSyncPreview.accept(userDataSyncResource.syncResource, userDataSyncResource.remote);
            });
            await this.reopen(userDataSyncResource);
        }
        async mergeResource(previewResource) {
            await this.withProgress(() => this.userDataSyncPreview.merge(previewResource.merged));
            previewResource = this.userDataSyncPreview.resources.find(({ local }) => (0, resources_1.isEqual)(local, previewResource.local));
            await this.reopen(previewResource);
            if (previewResource.mergeState === "conflict" /* Conflict */) {
                await this.dialogService.show(notification_1.Severity.Warning, (0, nls_1.localize)(8, null), [], {
                    detail: (0, nls_1.localize)(9, null)
                });
            }
        }
        async discardResource(previewResource) {
            this.close(previewResource);
            return this.withProgress(() => this.userDataSyncPreview.discard(previewResource.merged));
        }
        async apply() {
            this.closeAll();
            this.syncButton.label = (0, nls_1.localize)(10, null);
            this.syncButton.enabled = false;
            this.cancelButton.enabled = false;
            try {
                await this.withProgress(async () => this.userDataSyncPreview.apply());
            }
            catch (error) {
                this.syncButton.enabled = false;
                this.cancelButton.enabled = true;
            }
        }
        async cancel() {
            for (const resource of this.userDataSyncPreview.resources) {
                this.close(resource);
            }
            await this.userDataSyncPreview.cancel();
        }
        async open(previewResource) {
            if (previewResource.mergeState === "accepted" /* Accepted */) {
                if (previewResource.localChange !== 3 /* Deleted */ && previewResource.remoteChange !== 3 /* Deleted */) {
                    // Do not open deleted preview
                    await this.editorService.openEditor({
                        resource: previewResource.accepted,
                        label: (0, nls_1.localize)(11, null, (0, resources_1.basename)(previewResource.accepted)),
                        options: { pinned: true }
                    });
                }
            }
            else {
                const leftResource = previewResource.remote;
                const rightResource = previewResource.mergeState === "conflict" /* Conflict */ ? previewResource.merged : previewResource.local;
                const leftResourceName = (0, nls_1.localize)(12, null, (0, resources_1.basename)(leftResource));
                const rightResourceName = previewResource.mergeState === "conflict" /* Conflict */ ? (0, nls_1.localize)(13, null, (0, resources_1.basename)(rightResource))
                    : (0, nls_1.localize)(14, null, (0, resources_1.basename)(rightResource));
                await this.editorService.openEditor({
                    leftResource,
                    rightResource,
                    label: (0, nls_1.localize)(15, null, leftResourceName, rightResourceName),
                    description: (0, nls_1.localize)(16, null),
                    options: {
                        preserveFocus: true,
                        revealIfVisible: true,
                        pinned: true
                    },
                });
            }
        }
        async reopen(previewResource) {
            this.close(previewResource);
            const resource = this.userDataSyncPreview.resources.find(({ local }) => (0, resources_1.isEqual)(local, previewResource.local));
            if (resource) {
                // select the resource
                await this.treeView.refresh();
                this.treeView.setSelection([this.treeItems.get(JSON.stringify(resource))]);
                await this.open(resource);
            }
        }
        close(previewResource) {
            for (const input of this.editorService.editors) {
                if (input instanceof diffEditorInput_1.DiffEditorInput) {
                    // Close all diff editors
                    if ((0, resources_1.isEqual)(previewResource.remote, input.secondary.resource)) {
                        input.dispose();
                    }
                }
                // Close all preview editors
                else if ((0, resources_1.isEqual)(previewResource.accepted, input.resource)) {
                    input.dispose();
                }
            }
        }
        closeDiffEditors() {
            for (const previewResource of this.userDataSyncPreview.resources) {
                if (previewResource.mergeState === "accepted" /* Accepted */) {
                    for (const input of this.editorService.editors) {
                        if (input instanceof diffEditorInput_1.DiffEditorInput) {
                            if ((0, resources_1.isEqual)(previewResource.remote, input.secondary.resource) &&
                                ((0, resources_1.isEqual)(previewResource.merged, input.primary.resource) || (0, resources_1.isEqual)(previewResource.local, input.primary.resource))) {
                                input.dispose();
                            }
                        }
                    }
                }
            }
        }
        closeAll() {
            for (const previewResource of this.userDataSyncPreview.resources) {
                this.close(previewResource);
            }
        }
        withProgress(task) {
            return this.progressService.withProgress({ location: userDataSync_2.SYNC_MERGES_VIEW_ID, delay: 500 }, task);
        }
    };
    UserDataSyncMergesViewPane = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, dialogs_1.IDialogService),
        __param(3, progress_1.IProgressService),
        __param(4, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(5, decorations_1.IDecorationsService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, instantiation_1.IInstantiationService),
        __param(12, opener_1.IOpenerService),
        __param(13, themeService_1.IThemeService),
        __param(14, telemetry_1.ITelemetryService)
    ], UserDataSyncMergesViewPane);
    exports.UserDataSyncMergesViewPane = UserDataSyncMergesViewPane;
    class UserDataSyncResourcesDecorationProvider extends lifecycle_1.Disposable {
        constructor(userDataSyncPreview) {
            super();
            this.userDataSyncPreview = userDataSyncPreview;
            this.label = (0, nls_1.localize)(17, null);
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._register(userDataSyncPreview.onDidChangeResources(c => this._onDidChange.fire(c.map(({ remote }) => remote))));
        }
        provideDecorations(resource) {
            const userDataSyncResource = this.userDataSyncPreview.resources.find(c => (0, resources_1.isEqual)(c.remote, resource));
            if (userDataSyncResource) {
                switch (userDataSyncResource.mergeState) {
                    case "conflict" /* Conflict */:
                        return { letter: '⚠', color: colorRegistry_1.listWarningForeground, tooltip: (0, nls_1.localize)(18, null) };
                    case "accepted" /* Accepted */:
                        return { letter: '✓', color: colorRegistry_1.listDeemphasizedForeground, tooltip: (0, nls_1.localize)(19, null) };
                }
            }
            return undefined;
        }
    }
    let AcceptChangesContribution = class AcceptChangesContribution extends lifecycle_1.Disposable {
        constructor(editor, instantiationService, userDataSyncService, configurationService, telemetryService, userDataSyncWorkbenchService) {
            super();
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.userDataSyncService = userDataSyncService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.update();
            this.registerListeners();
        }
        static get(editor) {
            return editor.getContribution(AcceptChangesContribution.ID);
        }
        registerListeners() {
            this._register(this.editor.onDidChangeModel(() => this.update()));
            this._register(this.userDataSyncService.onDidChangeConflicts(() => this.update()));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('diffEditor.renderSideBySide'))(() => this.update()));
        }
        update() {
            if (!this.shouldShowButton(this.editor)) {
                this.disposeAcceptChangesWidgetRenderer();
                return;
            }
            this.createAcceptChangesWidgetRenderer();
        }
        shouldShowButton(editor) {
            const model = editor.getModel();
            if (!model) {
                return false; // we need a model
            }
            const userDataSyncResource = this.getUserDataSyncResource(model.uri);
            if (!userDataSyncResource) {
                return false;
            }
            return true;
        }
        createAcceptChangesWidgetRenderer() {
            if (!this.acceptChangesButton) {
                const resource = this.editor.getModel().uri;
                const userDataSyncResource = this.getUserDataSyncResource(resource);
                const isRemoteResource = (0, resources_1.isEqual)(userDataSyncResource.remote, resource);
                const isLocalResource = (0, resources_1.isEqual)(userDataSyncResource.local, resource);
                const label = isRemoteResource ? (0, nls_1.localize)(20, null)
                    : isLocalResource ? (0, nls_1.localize)(21, null)
                        : (0, nls_1.localize)(22, null);
                this.acceptChangesButton = this.instantiationService.createInstance(codeeditor_1.FloatingClickWidget, this.editor, label, null);
                this._register(this.acceptChangesButton.onClick(async () => {
                    const model = this.editor.getModel();
                    if (model) {
                        this.telemetryService.publicLog2('sync/acceptChanges', { source: userDataSyncResource.syncResource, action: isRemoteResource ? 'acceptRemote' : isLocalResource ? 'acceptLocal' : 'acceptMerges' });
                        await this.userDataSyncWorkbenchService.userDataSyncPreview.accept(userDataSyncResource.syncResource, model.uri, model.getValue());
                    }
                }));
                this.acceptChangesButton.render();
            }
        }
        getUserDataSyncResource(resource) {
            return this.userDataSyncWorkbenchService.userDataSyncPreview.resources.find(r => (0, resources_1.isEqual)(resource, r.local) || (0, resources_1.isEqual)(resource, r.remote) || (0, resources_1.isEqual)(resource, r.merged));
        }
        disposeAcceptChangesWidgetRenderer() {
            (0, lifecycle_1.dispose)(this.acceptChangesButton);
            this.acceptChangesButton = undefined;
        }
        dispose() {
            this.disposeAcceptChangesWidgetRenderer();
            super.dispose();
        }
    };
    AcceptChangesContribution.ID = 'editor.contrib.acceptChangesButton';
    AcceptChangesContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, userDataSync_1.IUserDataSyncService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, userDataSync_2.IUserDataSyncWorkbenchService)
    ], AcceptChangesContribution);
    (0, editorExtensions_1.registerEditorContribution)(AcceptChangesContribution.ID, AcceptChangesContribution);
});
//# sourceMappingURL=userDataSyncMergesView.js.map