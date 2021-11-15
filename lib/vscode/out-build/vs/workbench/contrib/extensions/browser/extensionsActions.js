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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsActions", "vs/base/common/actions", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/json", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/configuration/common/jsonEditing", "vs/editor/common/services/resolverService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/browser/ui/aria/aria", "vs/base/common/arrays", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/platform/product/common/productService", "vs/platform/dialogs/common/dialogs", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/errors", "vs/platform/userDataSync/common/userDataSync", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/log/common/log", "vs/workbench/contrib/logs/common/logConstants", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/base/common/platform", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/css!./media/extensionActions"], function (require, exports, nls_1, actions_1, async_1, DOM, event_1, json, contextView_1, lifecycle_1, extensions_1, extensionsFileTemplate_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensions_2, instantiation_1, viewlet_1, files_1, workspace_1, host_1, extensions_3, uri_1, commands_1, configuration_1, themeService_1, colorRegistry_1, jsonEditing_1, resolverService_1, contextkey_1, actions_2, workspaceCommands_1, notification_1, opener_1, editorService_1, quickInput_1, cancellation_1, aria_1, arrays_1, workbenchThemeService_1, label_1, textfiles_1, productService_1, dialogs_1, progress_1, actionViewItems_1, workspaceExtensionsConfig_1, errors_1, userDataSync_1, dropdownActionViewItem_1, log_1, Constants, extensionsIcons_1, platform_1, workspaceTrust_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionButtonProminentHoverBackground = exports.extensionButtonProminentForeground = exports.extensionButtonProminentBackground = exports.InstallRemoteExtensionsInLocalAction = exports.InstallLocalExtensionsInRemoteAction = exports.AbstractInstallExtensionsInServerAction = exports.InstallSpecificVersionOfExtensionAction = exports.ReinstallAction = exports.SystemDisabledWarningAction = exports.ExtensionToolTipAction = exports.ToggleSyncExtensionAction = exports.MaliciousStatusLabelAction = exports.StatusLabelAction = exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = exports.ConfigureWorkspaceRecommendedExtensionsAction = exports.AbstractConfigureRecommendedExtensionsAction = exports.SearchExtensionsAction = exports.UndoIgnoreExtensionRecommendationAction = exports.IgnoreExtensionRecommendationAction = exports.InstallRecommendedExtensionAction = exports.ShowRecommendedExtensionAction = exports.SetProductIconThemeAction = exports.SetFileIconThemeAction = exports.SetColorThemeAction = exports.ReloadAction = exports.DisableDropDownAction = exports.EnableDropDownAction = exports.DisableGloballyAction = exports.DisableForWorkspaceAction = exports.EnableGloballyAction = exports.EnableForWorkspaceAction = exports.InstallAnotherVersionAction = exports.MenuItemExtensionAction = exports.ExtensionEditorManageExtensionAction = exports.ManageExtensionAction = exports.getContextMenuActions = exports.DropDownMenuActionViewItem = exports.ExtensionDropDownAction = exports.ExtensionActionWithDropdownActionViewItem = exports.UpdateAction = exports.UninstallAction = exports.WebInstallAction = exports.LocalInstallAction = exports.RemoteInstallAction = exports.InstallInOtherServerAction = exports.InstallingLabelAction = exports.InstallDropdownAction = exports.InstallAndSyncAction = exports.InstallAction = exports.AbstractInstallAction = exports.ActionWithDropDownAction = exports.ExtensionAction = exports.PromptExtensionInstallFailureAction = void 0;
    function getRelativeDateLabel(date) {
        const delta = new Date().getTime() - date.getTime();
        const year = 365 * 24 * 60 * 60 * 1000;
        if (delta > year) {
            const noOfYears = Math.floor(delta / year);
            return noOfYears > 1 ? (0, nls_1.localize)(0, null, noOfYears) : (0, nls_1.localize)(1, null);
        }
        const month = 30 * 24 * 60 * 60 * 1000;
        if (delta > month) {
            const noOfMonths = Math.floor(delta / month);
            return noOfMonths > 1 ? (0, nls_1.localize)(2, null, noOfMonths) : (0, nls_1.localize)(3, null);
        }
        const day = 24 * 60 * 60 * 1000;
        if (delta > day) {
            const noOfDays = Math.floor(delta / day);
            return noOfDays > 1 ? (0, nls_1.localize)(4, null, noOfDays) : (0, nls_1.localize)(5, null);
        }
        const hour = 60 * 60 * 1000;
        if (delta > hour) {
            const noOfHours = Math.floor(delta / day);
            return noOfHours > 1 ? (0, nls_1.localize)(6, null, noOfHours) : (0, nls_1.localize)(7, null);
        }
        if (delta > 0) {
            return (0, nls_1.localize)(8, null);
        }
        return '';
    }
    let PromptExtensionInstallFailureAction = class PromptExtensionInstallFailureAction extends actions_1.Action {
        constructor(extension, version, installOperation, error, productService, openerService, notificationService, dialogService, commandService, logService) {
            super('extension.promptExtensionInstallFailure');
            this.extension = extension;
            this.version = version;
            this.installOperation = installOperation;
            this.error = error;
            this.productService = productService;
            this.openerService = openerService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            this.logService = logService;
        }
        async run() {
            if ((0, errors_1.isPromiseCanceledError)(this.error)) {
                return;
            }
            this.logService.error(this.error);
            if (this.error.name === extensionManagement_1.INSTALL_ERROR_NOT_SUPPORTED) {
                const productName = platform_1.isWeb ? (0, nls_1.localize)(9, null) : this.productService.nameLong;
                const message = (0, nls_1.localize)(10, null, this.extension.displayName || this.extension.identifier.id, productName);
                const result = await this.dialogService.show(notification_1.Severity.Info, message, [(0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null)], { cancelId: 0 });
                if (result.choice === 1) {
                    this.openerService.open(platform_1.isWeb ? uri_1.URI.parse('https://aka.ms/vscode-remote-codespaces') : uri_1.URI.parse('https://aka.ms/vscode-remote'));
                }
                return;
            }
            if ([extensionManagement_1.INSTALL_ERROR_INCOMPATIBLE, extensionManagement_1.INSTALL_ERROR_MALICIOUS].includes(this.error.name)) {
                await this.dialogService.show(notification_1.Severity.Info, (0, errors_1.getErrorMessage)(this.error), []);
                return;
            }
            const promptChoices = [];
            if (this.extension.gallery && this.productService.extensionsGallery) {
                promptChoices.push({
                    label: (0, nls_1.localize)(13, null),
                    run: () => this.openerService.open(uri_1.URI.parse(`${this.productService.extensionsGallery.serviceUrl}/publishers/${this.extension.publisher}/vsextensions/${this.extension.name}/${this.version}/vspackage`)).then(() => {
                        this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(14, null, this.extension.identifier.id), [{
                                label: (0, nls_1.localize)(15, null),
                                run: () => this.commandService.executeCommand(extensions_1.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID)
                            }]);
                    })
                });
            }
            const operationMessage = this.installOperation === 2 /* Update */ ? (0, nls_1.localize)(16, null, this.extension.displayName || this.extension.identifier.id)
                : (0, nls_1.localize)(17, null, this.extension.displayName || this.extension.identifier.id);
            const checkLogsMessage = (0, nls_1.localize)(18, null, `command:${Constants.showWindowLogActionId}`);
            this.notificationService.prompt(notification_1.Severity.Error, `${operationMessage} ${checkLogsMessage}`, promptChoices);
        }
    };
    PromptExtensionInstallFailureAction = __decorate([
        __param(4, productService_1.IProductService),
        __param(5, opener_1.IOpenerService),
        __param(6, notification_1.INotificationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService),
        __param(9, log_1.ILogService)
    ], PromptExtensionInstallFailureAction);
    exports.PromptExtensionInstallFailureAction = PromptExtensionInstallFailureAction;
    class ExtensionAction extends actions_1.Action {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
    }
    exports.ExtensionAction = ExtensionAction;
    ExtensionAction.EXTENSION_ACTION_CLASS = 'extension-action';
    ExtensionAction.TEXT_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} text`;
    ExtensionAction.LABEL_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} label`;
    ExtensionAction.ICON_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} icon`;
    class ActionWithDropDownAction extends ExtensionAction {
        constructor(id, label, actions) {
            super(id, label);
            this.actions = actions;
            this._menuActions = [];
            this.update();
            this._register(event_1.Event.any(...actions.map(a => a.onDidChange))(() => this.update(true)));
            actions.forEach(a => this._register(a));
        }
        get menuActions() { return [...this._menuActions]; }
        get extension() {
            return super.extension;
        }
        set extension(extension) {
            this.actions.forEach(a => a.extension = extension);
            super.extension = extension;
        }
        update(donotUpdateActions) {
            var _a;
            if (!donotUpdateActions) {
                this.actions.forEach(a => a.update());
            }
            const enabledActions = this.actions.filter(a => a.enabled);
            this.action = enabledActions[0];
            this._menuActions = enabledActions.slice(1);
            this.enabled = !!this.action;
            if (this.action) {
                this.label = this.action.label;
                this.tooltip = this.action.tooltip;
            }
            let clazz = ((_a = (this.action || this.actions[0])) === null || _a === void 0 ? void 0 : _a.class) || '';
            clazz = clazz ? `${clazz} action-dropdown` : 'action-dropdown';
            if (this._menuActions.length === 0) {
                clazz += ' action-dropdown';
            }
            this.class = clazz;
        }
        run() {
            const enabledActions = this.actions.filter(a => a.enabled);
            return enabledActions[0].run();
        }
    }
    exports.ActionWithDropDownAction = ActionWithDropDownAction;
    let AbstractInstallAction = class AbstractInstallAction extends ExtensionAction {
        constructor(id, label, cssClass, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService) {
            super(id, label, cssClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.instantiationService = instantiationService;
            this.runtimeExtensionService = runtimeExtensionService;
            this.workbenchThemeService = workbenchThemeService;
            this.labelService = labelService;
            this._manifest = null;
            this.update();
            this._register(this.labelService.onDidChangeFormatters(() => this.updateLabel(), this));
        }
        set manifest(manifest) {
            this._manifest = manifest;
            this.updateLabel();
        }
        update() {
            this.enabled = false;
            if (this.extension && !this.extension.isBuiltin) {
                if (this.extension.state === 3 /* Uninstalled */ && this.extensionsWorkbenchService.canInstall(this.extension)) {
                    this.enabled = true;
                    this.updateLabel();
                }
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            this.extensionsWorkbenchService.open(this.extension);
            (0, aria_1.alert)((0, nls_1.localize)(19, null, this.extension.displayName));
            const extension = await this.install(this.extension);
            if (extension === null || extension === void 0 ? void 0 : extension.local) {
                (0, aria_1.alert)((0, nls_1.localize)(20, null, this.extension.displayName));
                const runningExtension = await this.getRunningExtension(extension.local);
                if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some(activationEent => activationEent.startsWith('onLanguage')))) {
                    let action = await SetColorThemeAction.create(this.workbenchThemeService, this.instantiationService, extension)
                        || await SetFileIconThemeAction.create(this.workbenchThemeService, this.instantiationService, extension)
                        || await SetProductIconThemeAction.create(this.workbenchThemeService, this.instantiationService, extension);
                    if (action) {
                        try {
                            return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
                        }
                        finally {
                            action.dispose();
                        }
                    }
                }
            }
        }
        async install(extension) {
            try {
                return await this.extensionsWorkbenchService.install(extension, this.getInstallOptions());
            }
            catch (error) {
                await this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 1 /* Install */, error).run();
                return undefined;
            }
        }
        async getRunningExtension(extension) {
            const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
            if (runningExtension) {
                return runningExtension;
            }
            if (this.runtimeExtensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension))) {
                return new Promise((c, e) => {
                    const disposable = this.runtimeExtensionService.onDidChangeExtensions(async () => {
                        const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
                        if (runningExtension) {
                            disposable.dispose();
                            c(runningExtension);
                        }
                    });
                });
            }
            return null;
        }
    };
    AbstractInstallAction.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`;
    AbstractInstallAction = __decorate([
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, extensions_3.IExtensionService),
        __param(6, workbenchThemeService_1.IWorkbenchThemeService),
        __param(7, label_1.ILabelService)
    ], AbstractInstallAction);
    exports.AbstractInstallAction = AbstractInstallAction;
    let InstallAction = class InstallAction extends AbstractInstallAction {
        constructor(extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, extensionManagementServerService, workbenchExtensioManagementService, userDataAutoSyncEnablementService, userDataSyncResourceEnablementService) {
            super(`extensions.installAndSync`, (0, nls_1.localize)(21, null), InstallAction.Class, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.workbenchExtensioManagementService = workbenchExtensioManagementService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.userDataSyncResourceEnablementService = userDataSyncResourceEnablementService;
            this.updateLabel();
            this._register(labelService.onDidChangeFormatters(() => this.updateLabel(), this));
            this._register(event_1.Event.any(userDataAutoSyncEnablementService.onDidChangeEnablement, event_1.Event.filter(userDataSyncResourceEnablementService.onDidChangeResourceEnablement, e => e[0] === "extensions" /* Extensions */))(() => this.update()));
        }
        updateLabel() {
            if (!this.extension) {
                return;
            }
            const isMachineScoped = this.getInstallOptions().isMachineScoped;
            this.label = isMachineScoped ? (0, nls_1.localize)(22, null) : (0, nls_1.localize)(23, null);
            // When remote connection exists
            if (this._manifest && this.extensionManagementServerService.remoteExtensionManagementServer) {
                const server = this.workbenchExtensioManagementService.getExtensionManagementServerToInstall(this._manifest);
                if (server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                    const host = this.extensionManagementServerService.remoteExtensionManagementServer.label;
                    this.label = isMachineScoped
                        ? (0, nls_1.localize)(24, null, host)
                        : (0, nls_1.localize)(25, null, host);
                    return;
                }
                this.label = isMachineScoped ? (0, nls_1.localize)(26, null) : (0, nls_1.localize)(27, null);
                return;
            }
        }
        getInstallOptions() {
            return { isMachineScoped: this.userDataAutoSyncEnablementService.isEnabled() && this.userDataSyncResourceEnablementService.isResourceEnabled("extensions" /* Extensions */) };
        }
    };
    InstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, extensions_3.IExtensionService),
        __param(3, workbenchThemeService_1.IWorkbenchThemeService),
        __param(4, label_1.ILabelService),
        __param(5, extensionManagement_2.IExtensionManagementServerService),
        __param(6, extensionManagement_2.IWorkbenchExtensionManagementService),
        __param(7, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(8, userDataSync_1.IUserDataSyncResourceEnablementService)
    ], InstallAction);
    exports.InstallAction = InstallAction;
    let InstallAndSyncAction = class InstallAndSyncAction extends AbstractInstallAction {
        constructor(extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, productService, userDataAutoSyncEnablementService, userDataSyncResourceEnablementService) {
            super(`extensions.installAndSync`, (0, nls_1.localize)(28, null), InstallAndSyncAction.Class, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService);
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.userDataSyncResourceEnablementService = userDataSyncResourceEnablementService;
            this.tooltip = (0, nls_1.localize)(29, null, productService.nameLong);
            this._register(event_1.Event.any(userDataAutoSyncEnablementService.onDidChangeEnablement, event_1.Event.filter(userDataSyncResourceEnablementService.onDidChangeResourceEnablement, e => e[0] === "extensions" /* Extensions */))(() => this.update()));
        }
        update() {
            super.update();
            if (this.enabled) {
                this.enabled = this.userDataAutoSyncEnablementService.isEnabled() && this.userDataSyncResourceEnablementService.isResourceEnabled("extensions" /* Extensions */);
            }
        }
        updateLabel() { }
        getInstallOptions() {
            return { isMachineScoped: false };
        }
    };
    InstallAndSyncAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, extensions_3.IExtensionService),
        __param(3, workbenchThemeService_1.IWorkbenchThemeService),
        __param(4, label_1.ILabelService),
        __param(5, productService_1.IProductService),
        __param(6, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(7, userDataSync_1.IUserDataSyncResourceEnablementService)
    ], InstallAndSyncAction);
    exports.InstallAndSyncAction = InstallAndSyncAction;
    let InstallDropdownAction = class InstallDropdownAction extends ActionWithDropDownAction {
        set manifest(manifest) {
            this.actions.forEach(a => a.manifest = manifest);
            this.actions.forEach(a => a.update());
            this.update();
        }
        constructor(instantiationService) {
            super(`extensions.installActions`, '', [
                instantiationService.createInstance(InstallAndSyncAction),
                instantiationService.createInstance(InstallAction),
            ]);
        }
    };
    InstallDropdownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], InstallDropdownAction);
    exports.InstallDropdownAction = InstallDropdownAction;
    class InstallingLabelAction extends ExtensionAction {
        constructor() {
            super('extension.installing', InstallingLabelAction.LABEL, InstallingLabelAction.CLASS, false);
        }
        update() {
            this.class = `${InstallingLabelAction.CLASS}${this.extension && this.extension.state === 0 /* Installing */ ? '' : ' hide'}`;
        }
    }
    exports.InstallingLabelAction = InstallingLabelAction;
    InstallingLabelAction.LABEL = (0, nls_1.localize)(30, null);
    InstallingLabelAction.CLASS = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`;
    let InstallInOtherServerAction = class InstallInOtherServerAction extends ExtensionAction {
        constructor(id, server, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService) {
            super(id, InstallInOtherServerAction.INSTALL_LABEL, InstallInOtherServerAction.Class, false);
            this.server = server;
            this.canInstallAnyWhere = canInstallAnyWhere;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.updateWhenCounterExtensionChanges = true;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = InstallInOtherServerAction.Class;
            if (this.canInstall()) {
                const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server === this.server)[0];
                if (extensionInOtherServer) {
                    // Getting installed in other server
                    if (extensionInOtherServer.state === 0 /* Installing */ && !extensionInOtherServer.local) {
                        this.enabled = true;
                        this.label = InstallInOtherServerAction.INSTALLING_LABEL;
                        this.class = InstallInOtherServerAction.InstallingClass;
                    }
                }
                else {
                    // Not installed in other server
                    this.enabled = true;
                    this.label = this.getInstallLabel();
                }
            }
        }
        canInstall() {
            // Disable if extension is not installed or not an user extension
            if (!this.extension
                || !this.server
                || !this.extension.local
                || this.extension.state !== 1 /* Installed */
                || this.extension.type !== 1 /* User */
                || this.extension.enablementState === 2 /* DisabledByEnvironment */) {
                return false;
            }
            if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on UI
            if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Workspace
            if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Web
            if (this.server === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWeb(this.extension.local.manifest)) {
                return true;
            }
            if (this.canInstallAnyWhere) {
                // Can run on UI
                if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnUI(this.extension.local.manifest)) {
                    return true;
                }
                // Can run on Workspace
                if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWorkspace(this.extension.local.manifest)) {
                    return true;
                }
            }
            return false;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            if (this.server) {
                this.extensionsWorkbenchService.open(this.extension);
                (0, aria_1.alert)((0, nls_1.localize)(33, null, this.extension.displayName));
                if (this.extension.gallery) {
                    await this.server.extensionManagementService.installFromGallery(this.extension.gallery);
                }
                else {
                    const vsix = await this.extension.server.extensionManagementService.zip(this.extension.local);
                    await this.server.extensionManagementService.install(vsix);
                }
            }
        }
    };
    InstallInOtherServerAction.INSTALL_LABEL = (0, nls_1.localize)(31, null);
    InstallInOtherServerAction.INSTALLING_LABEL = (0, nls_1.localize)(32, null);
    InstallInOtherServerAction.Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`;
    InstallInOtherServerAction.InstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`;
    InstallInOtherServerAction = __decorate([
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, productService_1.IProductService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], InstallInOtherServerAction);
    exports.InstallInOtherServerAction = InstallInOtherServerAction;
    let RemoteInstallAction = class RemoteInstallAction extends InstallInOtherServerAction {
        constructor(canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService) {
            super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return this.extensionManagementServerService.remoteExtensionManagementServer
                ? (0, nls_1.localize)(34, null, this.extensionManagementServerService.remoteExtensionManagementServer.label)
                : InstallInOtherServerAction.INSTALL_LABEL;
        }
    };
    RemoteInstallAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IExtensionManagementServerService),
        __param(3, productService_1.IProductService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], RemoteInstallAction);
    exports.RemoteInstallAction = RemoteInstallAction;
    let LocalInstallAction = class LocalInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService) {
            super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService);
        }
        getInstallLabel() {
            return (0, nls_1.localize)(35, null);
        }
    };
    LocalInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, productService_1.IProductService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], LocalInstallAction);
    exports.LocalInstallAction = LocalInstallAction;
    let WebInstallAction = class WebInstallAction extends InstallInOtherServerAction {
        constructor(extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, webExtensionsScannerService, extensionManifestPropertiesService) {
            super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, productService, configurationService, extensionManifestPropertiesService);
            this.webExtensionsScannerService = webExtensionsScannerService;
        }
        getInstallLabel() {
            return (0, nls_1.localize)(36, null);
        }
        canInstall() {
            var _a;
            if (super.canInstall()) {
                return !!((_a = this.extension) === null || _a === void 0 ? void 0 : _a.gallery) && this.webExtensionsScannerService.canAddExtension(this.extension.gallery);
            }
            return false;
        }
    };
    WebInstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IExtensionManagementServerService),
        __param(2, productService_1.IProductService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, extensionManagement_2.IWebExtensionsScannerService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], WebInstallAction);
    exports.WebInstallAction = WebInstallAction;
    let UninstallAction = class UninstallAction extends ExtensionAction {
        constructor(extensionsWorkbenchService) {
            super('extensions.uninstall', UninstallAction.UninstallLabel, UninstallAction.UninstallClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.update();
        }
        update() {
            if (!this.extension) {
                this.enabled = false;
                return;
            }
            const state = this.extension.state;
            if (state === 2 /* Uninstalling */) {
                this.label = UninstallAction.UninstallingLabel;
                this.class = UninstallAction.UnInstallingClass;
                this.enabled = false;
                return;
            }
            this.label = UninstallAction.UninstallLabel;
            this.class = UninstallAction.UninstallClass;
            this.tooltip = UninstallAction.UninstallLabel;
            if (state !== 1 /* Installed */) {
                this.enabled = false;
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            this.enabled = true;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)(39, null, this.extension.displayName));
            return this.extensionsWorkbenchService.uninstall(this.extension).then(() => {
                (0, aria_1.alert)((0, nls_1.localize)(40, null, this.extension.displayName));
            });
        }
    };
    UninstallAction.UninstallLabel = (0, nls_1.localize)(37, null);
    UninstallAction.UninstallingLabel = (0, nls_1.localize)(38, null);
    UninstallAction.UninstallClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall`;
    UninstallAction.UnInstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall uninstalling`;
    UninstallAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService)
    ], UninstallAction);
    exports.UninstallAction = UninstallAction;
    let UpdateAction = class UpdateAction extends ExtensionAction {
        constructor(extensionsWorkbenchService, instantiationService) {
            super(`extensions.update`, '', UpdateAction.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.instantiationService = instantiationService;
            this.update();
        }
        update() {
            if (!this.extension) {
                this.enabled = false;
                this.class = UpdateAction.DisabledClass;
                this.label = this.getUpdateLabel();
                return;
            }
            if (this.extension.type !== 1 /* User */) {
                this.enabled = false;
                this.class = UpdateAction.DisabledClass;
                this.label = this.getUpdateLabel();
                return;
            }
            const canInstall = this.extensionsWorkbenchService.canInstall(this.extension);
            const isInstalled = this.extension.state === 1 /* Installed */;
            this.enabled = canInstall && isInstalled && this.extension.outdated;
            this.class = this.enabled ? UpdateAction.EnabledClass : UpdateAction.DisabledClass;
            this.label = this.extension.outdated ? this.getUpdateLabel(this.extension.latestVersion) : this.getUpdateLabel();
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.alert)((0, nls_1.localize)(41, null, this.extension.displayName, this.extension.latestVersion));
            return this.install(this.extension);
        }
        async install(extension) {
            try {
                await this.extensionsWorkbenchService.install(extension);
                (0, aria_1.alert)((0, nls_1.localize)(42, null, extension.displayName, extension.latestVersion));
            }
            catch (err) {
                this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* Update */, err).run();
            }
        }
        getUpdateLabel(version) {
            return version ? (0, nls_1.localize)(43, null, version) : (0, nls_1.localize)(44, null);
        }
    };
    UpdateAction.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent update`;
    UpdateAction.DisabledClass = `${UpdateAction.EnabledClass} disabled`;
    UpdateAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, instantiation_1.IInstantiationService)
    ], UpdateAction);
    exports.UpdateAction = UpdateAction;
    class ExtensionActionWithDropdownActionViewItem extends dropdownActionViewItem_1.ActionWithDropdownActionViewItem {
        constructor(action, options, contextMenuProvider) {
            super(null, action, options, contextMenuProvider);
        }
        render(container) {
            super.render(container);
            this.updateClass();
        }
        updateClass() {
            super.updateClass();
            if (this.element && this.dropdownMenuActionViewItem && this.dropdownMenuActionViewItem.element) {
                this.element.classList.toggle('empty', this._action.menuActions.length === 0);
                this.dropdownMenuActionViewItem.element.classList.toggle('hide', this._action.menuActions.length === 0);
            }
        }
    }
    exports.ExtensionActionWithDropdownActionViewItem = ExtensionActionWithDropdownActionViewItem;
    let ExtensionDropDownAction = class ExtensionDropDownAction extends ExtensionAction {
        constructor(id, label, cssClass, enabled, instantiationService) {
            super(id, label, cssClass, enabled);
            this.instantiationService = instantiationService;
            this._actionViewItem = null;
        }
        createActionViewItem() {
            this._actionViewItem = this.instantiationService.createInstance(DropDownMenuActionViewItem, this);
            return this._actionViewItem;
        }
        run({ actionGroups, disposeActionsOnHide }) {
            if (this._actionViewItem) {
                this._actionViewItem.showMenu(actionGroups, disposeActionsOnHide);
            }
            return Promise.resolve();
        }
    };
    ExtensionDropDownAction = __decorate([
        __param(4, instantiation_1.IInstantiationService)
    ], ExtensionDropDownAction);
    exports.ExtensionDropDownAction = ExtensionDropDownAction;
    let DropDownMenuActionViewItem = class DropDownMenuActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, contextMenuService) {
            super(null, action, { icon: true, label: true });
            this.contextMenuService = contextMenuService;
        }
        showMenu(menuActionGroups, disposeActionsOnHide) {
            if (this.element) {
                const actions = this.getActions(menuActionGroups);
                let elementPosition = DOM.getDomNodePagePosition(this.element);
                const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => actions,
                    actionRunner: this.actionRunner,
                    onHide: () => { if (disposeActionsOnHide) {
                        (0, lifecycle_1.dispose)(actions);
                    } }
                });
            }
        }
        getActions(menuActionGroups) {
            let actions = [];
            for (const menuActions of menuActionGroups) {
                actions = [...actions, ...menuActions, new actions_1.Separator()];
            }
            return actions.length ? actions.slice(0, actions.length - 1) : actions;
        }
    };
    DropDownMenuActionViewItem = __decorate([
        __param(1, contextView_1.IContextMenuService)
    ], DropDownMenuActionViewItem);
    exports.DropDownMenuActionViewItem = DropDownMenuActionViewItem;
    function getContextMenuActions(extension, inExtensionEditor, instantiationService) {
        return instantiationService.invokeFunction(accessor => {
            var _a;
            const menuService = accessor.get(actions_2.IMenuService);
            const extensionRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionRecommendationsService);
            const extensionIgnoredRecommendationsService = accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService);
            const cksOverlay = [];
            if (extension) {
                cksOverlay.push(['extension', extension.identifier.id]);
                cksOverlay.push(['isBuiltinExtension', extension.isBuiltin]);
                cksOverlay.push(['extensionHasConfiguration', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
                cksOverlay.push(['isExtensionRecommended', !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
                cksOverlay.push(['isExtensionWorkspaceRecommended', ((_a = extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.reasonId) === 0 /* Workspace */]);
                cksOverlay.push(['isUserIgnoredRecommendation', extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some(e => e === extension.identifier.id.toLowerCase())]);
                cksOverlay.push(['inExtensionEditor', inExtensionEditor]);
                if (extension.state === 1 /* Installed */) {
                    cksOverlay.push(['extensionStatus', 'installed']);
                }
            }
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService).createOverlay(cksOverlay);
            const groups = [];
            const menu = menuService.createMenu(actions_2.MenuId.ExtensionContext, contextKeyService);
            menu.getActions({ shouldForwardArgs: true }).forEach(([, actions]) => groups.push(actions.map(action => {
                if (action instanceof actions_1.SubmenuAction) {
                    return action;
                }
                return instantiationService.createInstance(MenuItemExtensionAction, action);
            })));
            menu.dispose();
            return groups;
        });
    }
    exports.getContextMenuActions = getContextMenuActions;
    let ManageExtensionAction = class ManageExtensionAction extends ExtensionDropDownAction {
        constructor(instantiationService, extensionService, workbenchThemeService) {
            super(ManageExtensionAction.ID, '', '', true, instantiationService);
            this.extensionService = extensionService;
            this.workbenchThemeService = workbenchThemeService;
            this.tooltip = (0, nls_1.localize)(45, null);
            this.update();
        }
        async getActionGroups(runningExtensions) {
            const groups = [];
            if (this.extension) {
                const actions = await Promise.all([
                    SetColorThemeAction.create(this.workbenchThemeService, this.instantiationService, this.extension),
                    SetFileIconThemeAction.create(this.workbenchThemeService, this.instantiationService, this.extension),
                    SetProductIconThemeAction.create(this.workbenchThemeService, this.instantiationService, this.extension)
                ]);
                const themesGroup = [];
                for (let action of actions) {
                    if (action) {
                        themesGroup.push(action);
                    }
                }
                if (themesGroup.length) {
                    groups.push(themesGroup);
                }
            }
            groups.push([
                this.instantiationService.createInstance(EnableGloballyAction),
                this.instantiationService.createInstance(EnableForWorkspaceAction)
            ]);
            groups.push([
                this.instantiationService.createInstance(DisableGloballyAction, runningExtensions),
                this.instantiationService.createInstance(DisableForWorkspaceAction, runningExtensions)
            ]);
            groups.push([
                this.instantiationService.createInstance(UninstallAction),
                this.instantiationService.createInstance(InstallAnotherVersionAction)
            ]);
            getContextMenuActions(this.extension, false, this.instantiationService).forEach(actions => groups.push(actions));
            groups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return groups;
        }
        async run() {
            const runtimeExtensions = await this.extensionService.getExtensions();
            return super.run({ actionGroups: await this.getActionGroups(runtimeExtensions), disposeActionsOnHide: true });
        }
        update() {
            this.class = ManageExtensionAction.HideManageExtensionClass;
            this.enabled = false;
            if (this.extension) {
                const state = this.extension.state;
                this.enabled = state === 1 /* Installed */;
                this.class = this.enabled || state === 2 /* Uninstalling */ ? ManageExtensionAction.Class : ManageExtensionAction.HideManageExtensionClass;
                this.tooltip = state === 2 /* Uninstalling */ ? (0, nls_1.localize)(46, null) : '';
            }
        }
    };
    ManageExtensionAction.ID = 'extensions.manage';
    ManageExtensionAction.Class = `${ExtensionAction.ICON_ACTION_CLASS} manage ` + themeService_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon);
    ManageExtensionAction.HideManageExtensionClass = `${ManageExtensionAction.Class} hide`;
    ManageExtensionAction = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, extensions_3.IExtensionService),
        __param(2, workbenchThemeService_1.IWorkbenchThemeService)
    ], ManageExtensionAction);
    exports.ManageExtensionAction = ManageExtensionAction;
    let ExtensionEditorManageExtensionAction = class ExtensionEditorManageExtensionAction extends ExtensionDropDownAction {
        constructor(instantiationService) {
            super('extensionEditor.manageExtension', '', `${ExtensionAction.ICON_ACTION_CLASS} manage ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.manageExtensionIcon)}`, true, instantiationService);
            this.tooltip = (0, nls_1.localize)(47, null);
        }
        update() { }
        run() {
            const actionGroups = [];
            getContextMenuActions(this.extension, true, this.instantiationService).forEach(actions => actionGroups.push(actions));
            actionGroups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof ExtensionAction) {
                    extensionAction.extension = this.extension;
                }
            }));
            return super.run({ actionGroups, disposeActionsOnHide: true });
        }
    };
    ExtensionEditorManageExtensionAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ExtensionEditorManageExtensionAction);
    exports.ExtensionEditorManageExtensionAction = ExtensionEditorManageExtensionAction;
    let MenuItemExtensionAction = class MenuItemExtensionAction extends ExtensionAction {
        constructor(action, extensionsWorkbenchService) {
            super(action.id, action.label);
            this.action = action;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.action.id === extensions_1.TOGGLE_IGNORE_EXTENSION_ACTION_ID) {
                this.checked = !this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
            }
        }
        async run() {
            if (this.extension) {
                await this.action.run(this.extension.identifier.id);
            }
        }
    };
    MenuItemExtensionAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService)
    ], MenuItemExtensionAction);
    exports.MenuItemExtensionAction = MenuItemExtensionAction;
    let InstallAnotherVersionAction = class InstallAnotherVersionAction extends ExtensionAction {
        constructor(extensionsWorkbenchService, extensionGalleryService, quickInputService, instantiationService) {
            super(InstallAnotherVersionAction.ID, InstallAnotherVersionAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.gallery && this.extension.state === 1 /* Installed */;
        }
        run() {
            if (!this.enabled) {
                return Promise.resolve();
            }
            return this.quickInputService.pick(this.getVersionEntries(), { placeHolder: (0, nls_1.localize)(49, null), matchOnDetail: true })
                .then(async (pick) => {
                if (pick) {
                    if (this.extension.version === pick.id) {
                        return Promise.resolve();
                    }
                    try {
                        if (pick.latest) {
                            await this.extensionsWorkbenchService.install(this.extension);
                        }
                        else {
                            await this.extensionsWorkbenchService.installVersion(this.extension, pick.id);
                        }
                    }
                    catch (error) {
                        this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, pick.latest ? this.extension.latestVersion : pick.id, 1 /* Install */, error).run();
                    }
                }
                return null;
            });
        }
        getVersionEntries() {
            return this.extensionGalleryService.getAllVersions(this.extension.gallery, true)
                .then(allVersions => allVersions.map((v, i) => ({ id: v.version, label: v.version, description: `${getRelativeDateLabel(new Date(Date.parse(v.date)))}${v.version === this.extension.version ? ` (${(0, nls_1.localize)(50, null)})` : ''}`, latest: i === 0 })));
        }
    };
    InstallAnotherVersionAction.ID = 'workbench.extensions.action.install.anotherVersion';
    InstallAnotherVersionAction.LABEL = (0, nls_1.localize)(48, null);
    InstallAnotherVersionAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, instantiation_1.IInstantiationService)
    ], InstallAnotherVersionAction);
    exports.InstallAnotherVersionAction = InstallAnotherVersionAction;
    let EnableForWorkspaceAction = class EnableForWorkspaceAction extends ExtensionAction {
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableForWorkspaceAction.ID, EnableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)(52, null);
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* Installed */
                    && !this.extensionEnablementService.isEnabled(this.extension.local)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 7 /* EnabledWorkspace */);
        }
    };
    EnableForWorkspaceAction.ID = 'extensions.enableForWorkspace';
    EnableForWorkspaceAction.LABEL = (0, nls_1.localize)(51, null);
    EnableForWorkspaceAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableForWorkspaceAction);
    exports.EnableForWorkspaceAction = EnableForWorkspaceAction;
    let EnableGloballyAction = class EnableGloballyAction extends ExtensionAction {
        constructor(extensionsWorkbenchService, extensionEnablementService) {
            super(EnableGloballyAction.ID, EnableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)(54, null);
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* Installed */
                    && this.extensionEnablementService.isDisabledGlobally(this.extension.local)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 6 /* EnabledGlobally */);
        }
    };
    EnableGloballyAction.ID = 'extensions.enableGlobally';
    EnableGloballyAction.LABEL = (0, nls_1.localize)(53, null);
    EnableGloballyAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], EnableGloballyAction);
    exports.EnableGloballyAction = EnableGloballyAction;
    let DisableForWorkspaceAction = class DisableForWorkspaceAction extends ExtensionAction {
        constructor(_runningExtensions, workspaceContextService, extensionsWorkbenchService, extensionEnablementService) {
            super(DisableForWorkspaceAction.ID, DisableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this._runningExtensions = _runningExtensions;
            this.workspaceContextService = workspaceContextService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)(56, null);
            this.update();
        }
        set runningExtensions(runningExtensions) {
            this._runningExtensions = runningExtensions;
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this._runningExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */)) {
                this.enabled = this.extension.state === 1 /* Installed */
                    && (this.extension.enablementState === 6 /* EnabledGlobally */ || this.extension.enablementState === 7 /* EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 5 /* DisabledWorkspace */);
        }
    };
    DisableForWorkspaceAction.ID = 'extensions.disableForWorkspace';
    DisableForWorkspaceAction.LABEL = (0, nls_1.localize)(55, null);
    DisableForWorkspaceAction = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], DisableForWorkspaceAction);
    exports.DisableForWorkspaceAction = DisableForWorkspaceAction;
    let DisableGloballyAction = class DisableGloballyAction extends ExtensionAction {
        constructor(_runningExtensions, extensionsWorkbenchService, extensionEnablementService) {
            super(DisableGloballyAction.ID, DisableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
            this._runningExtensions = _runningExtensions;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.tooltip = (0, nls_1.localize)(58, null);
            this.update();
        }
        set runningExtensions(runningExtensions) {
            this._runningExtensions = runningExtensions;
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this._runningExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))) {
                this.enabled = this.extension.state === 1 /* Installed */
                    && (this.extension.enablementState === 6 /* EnabledGlobally */ || this.extension.enablementState === 7 /* EnabledWorkspace */)
                    && this.extensionEnablementService.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.extensionsWorkbenchService.setEnablement(this.extension, 4 /* DisabledGlobally */);
        }
    };
    DisableGloballyAction.ID = 'extensions.disableGlobally';
    DisableGloballyAction.LABEL = (0, nls_1.localize)(57, null);
    DisableGloballyAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], DisableGloballyAction);
    exports.DisableGloballyAction = DisableGloballyAction;
    let EnableDropDownAction = class EnableDropDownAction extends ActionWithDropDownAction {
        constructor(instantiationService) {
            super('extensions.enable', (0, nls_1.localize)(59, null), [
                instantiationService.createInstance(EnableGloballyAction),
                instantiationService.createInstance(EnableForWorkspaceAction)
            ]);
        }
    };
    EnableDropDownAction = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], EnableDropDownAction);
    exports.EnableDropDownAction = EnableDropDownAction;
    let DisableDropDownAction = class DisableDropDownAction extends ActionWithDropDownAction {
        constructor(extensionService, instantiationService) {
            const actions = [
                instantiationService.createInstance(DisableGloballyAction, []),
                instantiationService.createInstance(DisableForWorkspaceAction, [])
            ];
            super('extensions.disable', (0, nls_1.localize)(60, null), actions);
            const updateRunningExtensions = async () => {
                const runningExtensions = await extensionService.getExtensions();
                actions.forEach(a => a.runningExtensions = runningExtensions);
            };
            updateRunningExtensions();
            this._register(extensionService.onDidChangeExtensions(() => updateRunningExtensions()));
        }
    };
    DisableDropDownAction = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, instantiation_1.IInstantiationService)
    ], DisableDropDownAction);
    exports.DisableDropDownAction = DisableDropDownAction;
    let ReloadAction = class ReloadAction extends ExtensionAction {
        constructor(extensionsWorkbenchService, hostService, extensionService, extensionEnablementService, extensionManagementServerService, extensionManifestPropertiesService, productService, configurationService) {
            super('extensions.reload', (0, nls_1.localize)(61, null), ReloadAction.DisabledClass, false);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.hostService = hostService;
            this.extensionService = extensionService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.updateWhenCounterExtensionChanges = true;
            this._runningExtensions = null;
            this._register(this.extensionService.onDidChangeExtensions(this.updateRunningExtensions, this));
            this.updateRunningExtensions();
        }
        updateRunningExtensions() {
            this.extensionService.getExtensions().then(runningExtensions => { this._runningExtensions = runningExtensions; this.update(); });
        }
        update() {
            this.enabled = false;
            this.tooltip = '';
            if (!this.extension || !this._runningExtensions) {
                return;
            }
            const state = this.extension.state;
            if (state === 0 /* Installing */ || state === 2 /* Uninstalling */) {
                return;
            }
            if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
                return;
            }
            this.computeReloadState();
            this.class = this.enabled ? ReloadAction.EnabledClass : ReloadAction.DisabledClass;
        }
        computeReloadState() {
            var _a;
            if (!this._runningExtensions || !this.extension) {
                return;
            }
            const isUninstalled = this.extension.state === 3 /* Uninstalled */;
            const runningExtension = this._runningExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
            if (isUninstalled) {
                const canRemoveRunningExtension = runningExtension && this.extensionService.canRemoveExtension(runningExtension);
                const isSameExtensionRunning = runningExtension && (!this.extension.server || this.extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)));
                if (!canRemoveRunningExtension && isSameExtensionRunning) {
                    this.enabled = true;
                    this.label = (0, nls_1.localize)(62, null);
                    this.tooltip = (0, nls_1.localize)(63, null);
                    (0, aria_1.alert)((0, nls_1.localize)(64, null, this.extension.displayName));
                }
                return;
            }
            if (this.extension.local) {
                const isSameExtensionRunning = runningExtension && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                const isEnabled = this.extensionEnablementService.isEnabled(this.extension.local);
                // Extension is running
                if (runningExtension) {
                    if (isEnabled) {
                        // No Reload is required if extension can run without reload
                        if (this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(this.extension.local))) {
                            return;
                        }
                        const runningExtensionServer = this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension));
                        if (isSameExtensionRunning) {
                            // Different version of same extension is running. Requires reload to run the current version
                            if (this.extension.version !== runningExtension.version) {
                                this.enabled = true;
                                this.label = (0, nls_1.localize)(65, null);
                                this.tooltip = (0, nls_1.localize)(66, null);
                                return;
                            }
                            const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)[0];
                            if (extensionInOtherServer) {
                                // This extension prefers to run on UI/Local side but is running in remote
                                if (runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                                    this.enabled = true;
                                    this.label = (0, nls_1.localize)(67, null);
                                    this.tooltip = (0, nls_1.localize)(68, null);
                                    return;
                                }
                                // This extension prefers to run on Workspace/Remote side but is running in local
                                if (runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                                    this.enabled = true;
                                    this.label = (0, nls_1.localize)(69, null);
                                    this.tooltip = (0, nls_1.localize)(70, null, (_a = this.extensionManagementServerService.remoteExtensionManagementServer) === null || _a === void 0 ? void 0 : _a.label);
                                    return;
                                }
                            }
                        }
                        else {
                            if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                                // This extension prefers to run on UI/Local side but is running in remote
                                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                                    this.enabled = true;
                                    this.label = (0, nls_1.localize)(71, null);
                                    this.tooltip = (0, nls_1.localize)(72, null);
                                }
                            }
                            if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                                // This extension prefers to run on Workspace/Remote side but is running in local
                                if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                                    this.enabled = true;
                                    this.label = (0, nls_1.localize)(73, null);
                                    this.tooltip = (0, nls_1.localize)(74, null);
                                }
                            }
                        }
                        return;
                    }
                    else {
                        if (isSameExtensionRunning) {
                            this.enabled = true;
                            this.label = (0, nls_1.localize)(75, null);
                            this.tooltip = (0, nls_1.localize)(76, null);
                        }
                    }
                    return;
                }
                // Extension is not running
                else {
                    if (isEnabled && !this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(this.extension.local))) {
                        this.enabled = true;
                        this.label = (0, nls_1.localize)(77, null);
                        this.tooltip = (0, nls_1.localize)(78, null);
                        return;
                    }
                    const otherServer = this.extension.server ? this.extension.server === this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer : null;
                    if (otherServer && this.extension.enablementState === 1 /* DisabledByExtensionKind */) {
                        const extensionInOtherServer = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server === otherServer)[0];
                        // Same extension in other server exists and
                        if (extensionInOtherServer && extensionInOtherServer.local && this.extensionEnablementService.isEnabled(extensionInOtherServer.local)) {
                            this.enabled = true;
                            this.label = (0, nls_1.localize)(79, null);
                            this.tooltip = (0, nls_1.localize)(80, null);
                            (0, aria_1.alert)((0, nls_1.localize)(81, null, this.extension.displayName));
                            return;
                        }
                    }
                }
            }
        }
        run() {
            return Promise.resolve(this.hostService.reload());
        }
    };
    ReloadAction.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} reload`;
    ReloadAction.DisabledClass = `${ReloadAction.EnabledClass} disabled`;
    ReloadAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, host_1.IHostService),
        __param(2, extensions_3.IExtensionService),
        __param(3, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(6, productService_1.IProductService),
        __param(7, configuration_1.IConfigurationService)
    ], ReloadAction);
    exports.ReloadAction = ReloadAction;
    function isThemeFromExtension(theme, extension) {
        return !!(extension && theme.extensionData && extensions_2.ExtensionIdentifier.equals(theme.extensionData.extensionId, extension.identifier.id));
    }
    function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
        const picks = [];
        for (const theme of themes) {
            if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
                picks.push({ label: theme.label, id: theme.id });
            }
        }
        if (showCurrentTheme) {
            picks.push({ type: 'separator', label: (0, nls_1.localize)(82, null) });
            picks.push({ label: currentTheme.label, id: currentTheme.id });
        }
        return picks;
    }
    let SetColorThemeAction = class SetColorThemeAction extends ExtensionAction {
        constructor(colorThemes, extensionService, workbenchThemeService, quickInputService) {
            super(`extensions.colorTheme`, (0, nls_1.localize)(83, null), SetColorThemeAction.DisabledClass, false);
            this.colorThemes = colorThemes;
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidColorThemeChange)(() => this.update(), this));
            this.update();
        }
        static async create(workbenchThemeService, instantiationService, extension) {
            const themes = await workbenchThemeService.getColorThemes();
            if (themes.some(th => isThemeFromExtension(th, extension))) {
                const action = instantiationService.createInstance(SetColorThemeAction, themes);
                action.extension = extension;
                return action;
            }
            return undefined;
        }
        update() {
            this.enabled = !!this.extension && (this.extension.state === 1 /* Installed */) && this.colorThemes.some(th => isThemeFromExtension(th, this.extension));
            this.class = this.enabled ? SetColorThemeAction.EnabledClass : SetColorThemeAction.DisabledClass;
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            this.colorThemes = await this.workbenchThemeService.getColorThemes();
            this.update();
            if (!this.enabled) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getColorTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(this.colorThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)(84, null),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setColorTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    SetColorThemeAction.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    SetColorThemeAction.DisabledClass = `${SetColorThemeAction.EnabledClass} disabled`;
    SetColorThemeAction = __decorate([
        __param(1, extensions_3.IExtensionService),
        __param(2, workbenchThemeService_1.IWorkbenchThemeService),
        __param(3, quickInput_1.IQuickInputService)
    ], SetColorThemeAction);
    exports.SetColorThemeAction = SetColorThemeAction;
    let SetFileIconThemeAction = class SetFileIconThemeAction extends ExtensionAction {
        constructor(fileIconThemes, extensionService, workbenchThemeService, quickInputService) {
            super(`extensions.fileIconTheme`, (0, nls_1.localize)(85, null), SetFileIconThemeAction.DisabledClass, false);
            this.fileIconThemes = fileIconThemes;
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidFileIconThemeChange)(() => this.update(), this));
            this.update();
        }
        static async create(workbenchThemeService, instantiationService, extension) {
            const themes = await workbenchThemeService.getFileIconThemes();
            if (themes.some(th => isThemeFromExtension(th, extension))) {
                const action = instantiationService.createInstance(SetFileIconThemeAction, themes);
                action.extension = extension;
                return action;
            }
            return undefined;
        }
        update() {
            this.enabled = !!this.extension && (this.extension.state === 1 /* Installed */) && this.fileIconThemes.some(th => isThemeFromExtension(th, this.extension));
            this.class = this.enabled ? SetFileIconThemeAction.EnabledClass : SetFileIconThemeAction.DisabledClass;
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            this.fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
            this.update();
            if (!this.enabled) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getFileIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(this.fileIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)(86, null),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setFileIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    SetFileIconThemeAction.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    SetFileIconThemeAction.DisabledClass = `${SetFileIconThemeAction.EnabledClass} disabled`;
    SetFileIconThemeAction = __decorate([
        __param(1, extensions_3.IExtensionService),
        __param(2, workbenchThemeService_1.IWorkbenchThemeService),
        __param(3, quickInput_1.IQuickInputService)
    ], SetFileIconThemeAction);
    exports.SetFileIconThemeAction = SetFileIconThemeAction;
    let SetProductIconThemeAction = class SetProductIconThemeAction extends ExtensionAction {
        constructor(productIconThemes, extensionService, workbenchThemeService, quickInputService) {
            super(`extensions.productIconTheme`, (0, nls_1.localize)(87, null), SetProductIconThemeAction.DisabledClass, false);
            this.productIconThemes = productIconThemes;
            this.workbenchThemeService = workbenchThemeService;
            this.quickInputService = quickInputService;
            this._register(event_1.Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidProductIconThemeChange)(() => this.update(), this));
            this.enabled = true; // enabled by default
            this.class = SetProductIconThemeAction.EnabledClass;
            //		this.update();
        }
        static async create(workbenchThemeService, instantiationService, extension) {
            const themes = await workbenchThemeService.getProductIconThemes();
            if (themes.some(th => isThemeFromExtension(th, extension))) {
                const action = instantiationService.createInstance(SetProductIconThemeAction, themes);
                action.extension = extension;
                return action;
            }
            return undefined;
        }
        update() {
            this.enabled = !!this.extension && (this.extension.state === 1 /* Installed */) && this.productIconThemes.some(th => isThemeFromExtension(th, this.extension));
            this.class = this.enabled ? SetProductIconThemeAction.EnabledClass : SetProductIconThemeAction.DisabledClass;
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            this.productIconThemes = await this.workbenchThemeService.getProductIconThemes();
            this.update();
            if (!this.enabled) {
                return;
            }
            const currentTheme = this.workbenchThemeService.getProductIconTheme();
            const delayer = new async_1.Delayer(100);
            const picks = getQuickPickEntries(this.productIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.quickInputService.pick(picks, {
                placeHolder: (0, nls_1.localize)(88, null),
                onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setProductIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.workbenchThemeService.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    SetProductIconThemeAction.EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    SetProductIconThemeAction.DisabledClass = `${SetProductIconThemeAction.EnabledClass} disabled`;
    SetProductIconThemeAction = __decorate([
        __param(1, extensions_3.IExtensionService),
        __param(2, workbenchThemeService_1.IWorkbenchThemeService),
        __param(3, quickInput_1.IQuickInputService)
    ], SetProductIconThemeAction);
    exports.SetProductIconThemeAction = SetProductIconThemeAction;
    let ShowRecommendedExtensionAction = class ShowRecommendedExtensionAction extends actions_1.Action {
        constructor(extensionId, viewletService, extensionWorkbenchService) {
            super(ShowRecommendedExtensionAction.ID, ShowRecommendedExtensionAction.LABEL, undefined, false);
            this.viewletService = viewletService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        run() {
            return this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
                .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
                .then(viewlet => {
                viewlet.search(`@id:${this.extensionId}`);
                viewlet.focus();
                return this.extensionWorkbenchService.queryGallery({ names: [this.extensionId], source: 'install-recommendation', pageSize: 1 }, cancellation_1.CancellationToken.None)
                    .then(pager => {
                    if (pager && pager.firstPage && pager.firstPage.length) {
                        const extension = pager.firstPage[0];
                        return this.extensionWorkbenchService.open(extension);
                    }
                    return null;
                });
            });
        }
    };
    ShowRecommendedExtensionAction.ID = 'workbench.extensions.action.showRecommendedExtension';
    ShowRecommendedExtensionAction.LABEL = (0, nls_1.localize)(89, null);
    ShowRecommendedExtensionAction = __decorate([
        __param(1, viewlet_1.IViewletService),
        __param(2, extensions_1.IExtensionsWorkbenchService)
    ], ShowRecommendedExtensionAction);
    exports.ShowRecommendedExtensionAction = ShowRecommendedExtensionAction;
    let InstallRecommendedExtensionAction = class InstallRecommendedExtensionAction extends actions_1.Action {
        constructor(extensionId, viewletService, instantiationService, extensionWorkbenchService) {
            super(InstallRecommendedExtensionAction.ID, InstallRecommendedExtensionAction.LABEL, undefined, false);
            this.viewletService = viewletService;
            this.instantiationService = instantiationService;
            this.extensionWorkbenchService = extensionWorkbenchService;
            this.extensionId = extensionId;
        }
        async run() {
            const viewlet = await this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true);
            const viewPaneContainer = viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer();
            viewPaneContainer.search(`@id:${this.extensionId}`);
            viewPaneContainer.focus();
            const pager = await this.extensionWorkbenchService.queryGallery({ names: [this.extensionId], source: 'install-recommendation', pageSize: 1 }, cancellation_1.CancellationToken.None);
            if (pager && pager.firstPage && pager.firstPage.length) {
                const extension = pager.firstPage[0];
                await this.extensionWorkbenchService.open(extension);
                try {
                    await this.extensionWorkbenchService.install(extension);
                }
                catch (err) {
                    this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 1 /* Install */, err).run();
                }
            }
        }
    };
    InstallRecommendedExtensionAction.ID = 'workbench.extensions.action.installRecommendedExtension';
    InstallRecommendedExtensionAction.LABEL = (0, nls_1.localize)(90, null);
    InstallRecommendedExtensionAction = __decorate([
        __param(1, viewlet_1.IViewletService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, extensions_1.IExtensionsWorkbenchService)
    ], InstallRecommendedExtensionAction);
    exports.InstallRecommendedExtensionAction = InstallRecommendedExtensionAction;
    let IgnoreExtensionRecommendationAction = class IgnoreExtensionRecommendationAction extends actions_1.Action {
        constructor(extension, extensionRecommendationsManagementService) {
            super(IgnoreExtensionRecommendationAction.ID, 'Ignore Recommendation');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = IgnoreExtensionRecommendationAction.Class;
            this.tooltip = (0, nls_1.localize)(91, null);
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, true);
            return Promise.resolve();
        }
    };
    IgnoreExtensionRecommendationAction.ID = 'extensions.ignore';
    IgnoreExtensionRecommendationAction.Class = `${ExtensionAction.LABEL_ACTION_CLASS} ignore`;
    IgnoreExtensionRecommendationAction = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], IgnoreExtensionRecommendationAction);
    exports.IgnoreExtensionRecommendationAction = IgnoreExtensionRecommendationAction;
    let UndoIgnoreExtensionRecommendationAction = class UndoIgnoreExtensionRecommendationAction extends actions_1.Action {
        constructor(extension, extensionRecommendationsManagementService) {
            super(UndoIgnoreExtensionRecommendationAction.ID, 'Undo');
            this.extension = extension;
            this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
            this.class = UndoIgnoreExtensionRecommendationAction.Class;
            this.tooltip = (0, nls_1.localize)(92, null);
            this.enabled = true;
        }
        run() {
            this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, false);
            return Promise.resolve();
        }
    };
    UndoIgnoreExtensionRecommendationAction.ID = 'extensions.ignore';
    UndoIgnoreExtensionRecommendationAction.Class = `${ExtensionAction.LABEL_ACTION_CLASS} undo-ignore`;
    UndoIgnoreExtensionRecommendationAction = __decorate([
        __param(1, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], UndoIgnoreExtensionRecommendationAction);
    exports.UndoIgnoreExtensionRecommendationAction = UndoIgnoreExtensionRecommendationAction;
    let SearchExtensionsAction = class SearchExtensionsAction extends actions_1.Action {
        constructor(searchValue, viewletService) {
            super('extensions.searchExtensions', (0, nls_1.localize)(93, null), undefined, true);
            this.searchValue = searchValue;
            this.viewletService = viewletService;
        }
        async run() {
            var _a;
            const viewPaneContainer = (_a = (await this.viewletService.openViewlet(extensions_1.VIEWLET_ID, true))) === null || _a === void 0 ? void 0 : _a.getViewPaneContainer();
            viewPaneContainer.search(this.searchValue);
            viewPaneContainer.focus();
        }
    };
    SearchExtensionsAction = __decorate([
        __param(1, viewlet_1.IViewletService)
    ], SearchExtensionsAction);
    exports.SearchExtensionsAction = SearchExtensionsAction;
    let AbstractConfigureRecommendedExtensionsAction = class AbstractConfigureRecommendedExtensionsAction extends actions_1.Action {
        constructor(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label);
            this.contextService = contextService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.editorService = editorService;
            this.jsonEditingService = jsonEditingService;
            this.textModelResolverService = textModelResolverService;
        }
        openExtensionsFile(extensionsFileResource) {
            return this.getOrCreateExtensionsFile(extensionsFileResource)
                .then(({ created, content }) => this.getSelectionPosition(content, extensionsFileResource, ['recommendations'])
                .then(selection => this.editorService.openEditor({
                resource: extensionsFileResource,
                options: {
                    pinned: created,
                    selection
                }
            })), error => Promise.reject(new Error((0, nls_1.localize)(94, null, error))));
        }
        openWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile)
                .then(content => this.getSelectionPosition(content.value.toString(), content.resource, ['extensions', 'recommendations']))
                .then(selection => this.editorService.openEditor({
                resource: workspaceConfigurationFile,
                options: {
                    selection,
                    forceReload: true // because content has changed
                }
            }));
        }
        getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile) {
            return Promise.resolve(this.fileService.readFile(workspaceConfigurationFile))
                .then(content => {
                const workspaceRecommendations = json.parse(content.value.toString())['extensions'];
                if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                    return this.jsonEditingService.write(workspaceConfigurationFile, [{ path: ['extensions'], value: { recommendations: [] } }], true)
                        .then(() => this.fileService.readFile(workspaceConfigurationFile));
                }
                return content;
            });
        }
        getSelectionPosition(content, resource, path) {
            const tree = json.parseTree(content);
            const node = json.findNodeAtLocation(tree, path);
            if (node && node.parent && node.parent.children) {
                const recommendationsValueNode = node.parent.children[1];
                const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
                const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
                return Promise.resolve(this.textModelResolverService.createModelReference(resource))
                    .then(reference => {
                    const position = reference.object.textEditorModel.getPositionAt(offset);
                    reference.dispose();
                    return {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    };
                });
            }
            return Promise.resolve(undefined);
        }
        getOrCreateExtensionsFile(extensionsFileResource) {
            return Promise.resolve(this.fileService.readFile(extensionsFileResource)).then(content => {
                return { created: false, extensionsFileResource, content: content.value.toString() };
            }, err => {
                return this.textFileService.write(extensionsFileResource, extensionsFileTemplate_1.ExtensionsConfigurationInitialContent).then(() => {
                    return { created: true, extensionsFileResource, content: extensionsFileTemplate_1.ExtensionsConfigurationInitialContent };
                });
            });
        }
    };
    AbstractConfigureRecommendedExtensionsAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, files_1.IFileService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], AbstractConfigureRecommendedExtensionsAction);
    exports.AbstractConfigureRecommendedExtensionsAction = AbstractConfigureRecommendedExtensionsAction;
    let ConfigureWorkspaceRecommendedExtensionsAction = class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.update(), this));
            this.update();
        }
        update() {
            this.enabled = this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
        }
        run() {
            switch (this.contextService.getWorkbenchState()) {
                case 2 /* FOLDER */:
                    return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                case 3 /* WORKSPACE */:
                    return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
            }
            return Promise.resolve();
        }
    };
    ConfigureWorkspaceRecommendedExtensionsAction.ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions';
    ConfigureWorkspaceRecommendedExtensionsAction.LABEL = (0, nls_1.localize)(95, null);
    ConfigureWorkspaceRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService)
    ], ConfigureWorkspaceRecommendedExtensionsAction);
    exports.ConfigureWorkspaceRecommendedExtensionsAction = ConfigureWorkspaceRecommendedExtensionsAction;
    let ConfigureWorkspaceFolderRecommendedExtensionsAction = class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this.commandService = commandService;
        }
        run() {
            const folderCount = this.contextService.getWorkspace().folders.length;
            const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
            return Promise.resolve(pickFolderPromise)
                .then(workspaceFolder => {
                if (workspaceFolder) {
                    return this.openExtensionsFile(workspaceFolder.toResource(workspaceExtensionsConfig_1.EXTENSIONS_CONFIG));
                }
                return null;
            });
        }
    };
    ConfigureWorkspaceFolderRecommendedExtensionsAction.ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions';
    ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL = (0, nls_1.localize)(96, null);
    ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorate([
        __param(2, files_1.IFileService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, editorService_1.IEditorService),
        __param(6, jsonEditing_1.IJSONEditingService),
        __param(7, resolverService_1.ITextModelService),
        __param(8, commands_1.ICommandService)
    ], ConfigureWorkspaceFolderRecommendedExtensionsAction);
    exports.ConfigureWorkspaceFolderRecommendedExtensionsAction = ConfigureWorkspaceFolderRecommendedExtensionsAction;
    let StatusLabelAction = class StatusLabelAction extends actions_1.Action {
        constructor(extensionService, extensionManagementServerService) {
            super('extensions.action.statusLabel', '', StatusLabelAction.DISABLED_CLASS, false);
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.initialStatus = null;
            this.status = null;
            this.enablementState = null;
            this._extension = null;
        }
        get extension() { return this._extension; }
        set extension(extension) {
            if (!(this._extension && extension && (0, extensionManagementUtil_1.areSameExtensions)(this._extension.identifier, extension.identifier))) {
                // Different extension. Reset
                this.initialStatus = null;
                this.status = null;
                this.enablementState = null;
            }
            this._extension = extension;
            this.update();
        }
        update() {
            this.computeLabel()
                .then(label => {
                this.label = label || '';
                this.class = label ? StatusLabelAction.ENABLED_CLASS : StatusLabelAction.DISABLED_CLASS;
            });
        }
        async computeLabel() {
            if (!this.extension) {
                return null;
            }
            const currentStatus = this.status;
            const currentEnablementState = this.enablementState;
            this.status = this.extension.state;
            if (this.initialStatus === null) {
                this.initialStatus = this.status;
            }
            this.enablementState = this.extension.enablementState;
            const runningExtensions = await this.extensionService.getExtensions();
            const canAddExtension = () => {
                const runningExtension = runningExtensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                if (this.extension.local) {
                    if (runningExtension && this.extension.version === runningExtension.version) {
                        return true;
                    }
                    return this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            const canRemoveExtension = () => {
                if (this.extension.local) {
                    if (runningExtensions.every(e => !((0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(e))))) {
                        return true;
                    }
                    return this.extensionService.canRemoveExtension((0, extensions_3.toExtensionDescription)(this.extension.local));
                }
                return false;
            };
            if (currentStatus !== null) {
                if (currentStatus === 0 /* Installing */ && this.status === 1 /* Installed */) {
                    return canAddExtension() ? this.initialStatus === 1 /* Installed */ ? (0, nls_1.localize)(97, null) : (0, nls_1.localize)(98, null) : null;
                }
                if (currentStatus === 2 /* Uninstalling */ && this.status === 3 /* Uninstalled */) {
                    this.initialStatus = this.status;
                    return canRemoveExtension() ? (0, nls_1.localize)(99, null) : null;
                }
            }
            if (currentEnablementState !== null) {
                const currentlyEnabled = currentEnablementState === 6 /* EnabledGlobally */ || currentEnablementState === 7 /* EnabledWorkspace */;
                const enabled = this.enablementState === 6 /* EnabledGlobally */ || this.enablementState === 7 /* EnabledWorkspace */;
                if (!currentlyEnabled && enabled) {
                    return canAddExtension() ? (0, nls_1.localize)(100, null) : null;
                }
                if (currentlyEnabled && !enabled) {
                    return canRemoveExtension() ? (0, nls_1.localize)(101, null) : null;
                }
            }
            return null;
        }
        run() {
            return Promise.resolve();
        }
    };
    StatusLabelAction.ENABLED_CLASS = `${ExtensionAction.TEXT_ACTION_CLASS} extension-status-label`;
    StatusLabelAction.DISABLED_CLASS = `${StatusLabelAction.ENABLED_CLASS} hide`;
    StatusLabelAction = __decorate([
        __param(0, extensions_3.IExtensionService),
        __param(1, extensionManagement_2.IExtensionManagementServerService)
    ], StatusLabelAction);
    exports.StatusLabelAction = StatusLabelAction;
    class MaliciousStatusLabelAction extends ExtensionAction {
        constructor(long) {
            const tooltip = (0, nls_1.localize)(102, null);
            const label = long ? tooltip : (0, nls_1.localize)(103, null);
            super('extensions.install', label, '', false);
            this.tooltip = (0, nls_1.localize)(104, null);
        }
        update() {
            if (this.extension && this.extension.isMalicious) {
                this.class = `${MaliciousStatusLabelAction.Class} malicious`;
            }
            else {
                this.class = `${MaliciousStatusLabelAction.Class} not-malicious`;
            }
        }
        run() {
            return Promise.resolve();
        }
    }
    exports.MaliciousStatusLabelAction = MaliciousStatusLabelAction;
    MaliciousStatusLabelAction.Class = `${ExtensionAction.TEXT_ACTION_CLASS} malicious-status`;
    let ToggleSyncExtensionAction = class ToggleSyncExtensionAction extends ExtensionDropDownAction {
        constructor(configurationService, extensionsWorkbenchService, userDataAutoSyncEnablementService, instantiationService) {
            super('extensions.sync', '', ToggleSyncExtensionAction.SYNC_CLASS, false, instantiationService);
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectedKeys.includes('settingsSync.ignoredExtensions'))(() => this.update()));
            this._register(userDataAutoSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = !!this.extension && this.userDataAutoSyncEnablementService.isEnabled() && this.extension.state === 1 /* Installed */;
            if (this.extension) {
                const isIgnored = this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
                this.class = isIgnored ? ToggleSyncExtensionAction.IGNORED_SYNC_CLASS : ToggleSyncExtensionAction.SYNC_CLASS;
                this.tooltip = isIgnored ? (0, nls_1.localize)(105, null) : (0, nls_1.localize)(106, null);
            }
        }
        async run() {
            return super.run({
                actionGroups: [
                    [
                        new actions_1.Action('extensions.syncignore', this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension) ? (0, nls_1.localize)(107, null) : (0, nls_1.localize)(108, null), undefined, true, () => this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(this.extension))
                    ]
                ], disposeActionsOnHide: true
            });
        }
    };
    ToggleSyncExtensionAction.IGNORED_SYNC_CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-sync ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.syncIgnoredIcon)}`;
    ToggleSyncExtensionAction.SYNC_CLASS = `${ToggleSyncExtensionAction.ICON_ACTION_CLASS} extension-sync ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.syncEnabledIcon)}`;
    ToggleSyncExtensionAction = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(3, instantiation_1.IInstantiationService)
    ], ToggleSyncExtensionAction);
    exports.ToggleSyncExtensionAction = ToggleSyncExtensionAction;
    let ExtensionToolTipAction = class ExtensionToolTipAction extends ExtensionAction {
        constructor(warningAction, reloadAction, extensionEnablementService, extensionService, extensionManagementServerService) {
            super('extensions.tooltip', warningAction.tooltip, `${ExtensionToolTipAction.Class} hide`, false);
            this.warningAction = warningAction;
            this.reloadAction = reloadAction;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionService = extensionService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.updateWhenCounterExtensionChanges = true;
            this._runningExtensions = null;
            this._register(warningAction.onDidChange(() => this.update(), this));
            this._register(this.extensionService.onDidChangeExtensions(this.updateRunningExtensions, this));
            this.updateRunningExtensions();
        }
        updateRunningExtensions() {
            this.extensionService.getExtensions().then(runningExtensions => { this._runningExtensions = runningExtensions; this.update(); });
        }
        update() {
            this.label = this.getTooltip();
            this.class = ExtensionToolTipAction.Class;
            if (!this.label) {
                this.class = `${ExtensionToolTipAction.Class} hide`;
            }
        }
        getTooltip() {
            if (!this.extension) {
                return '';
            }
            if (this.reloadAction.enabled) {
                return this.reloadAction.tooltip;
            }
            if (this.warningAction.tooltip) {
                return this.warningAction.tooltip;
            }
            if (this.extension && this.extension.local && this.extension.state === 1 /* Installed */ && this._runningExtensions) {
                const isRunning = this._runningExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
                const isEnabled = this.extensionEnablementService.isEnabled(this.extension.local);
                if (isEnabled && isRunning) {
                    if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                        if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                            return (0, nls_1.localize)(109, null, this.extension.server.label);
                        }
                    }
                    if (this.extension.enablementState === 6 /* EnabledGlobally */) {
                        return (0, nls_1.localize)(110, null);
                    }
                    if (this.extension.enablementState === 7 /* EnabledWorkspace */) {
                        return (0, nls_1.localize)(111, null);
                    }
                }
                if (!isEnabled && !isRunning) {
                    if (this.extension.enablementState === 4 /* DisabledGlobally */) {
                        return (0, nls_1.localize)(112, null);
                    }
                    if (this.extension.enablementState === 5 /* DisabledWorkspace */) {
                        return (0, nls_1.localize)(113, null);
                    }
                }
            }
            return '';
        }
        run() {
            return Promise.resolve(null);
        }
    };
    ExtensionToolTipAction.Class = `${ExtensionAction.TEXT_ACTION_CLASS} disable-status`;
    ExtensionToolTipAction = __decorate([
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(3, extensions_3.IExtensionService),
        __param(4, extensionManagement_2.IExtensionManagementServerService)
    ], ExtensionToolTipAction);
    exports.ExtensionToolTipAction = ExtensionToolTipAction;
    let SystemDisabledWarningAction = class SystemDisabledWarningAction extends ExtensionAction {
        constructor(extensionManagementServerService, labelService, extensionsWorkbenchService, extensionService, configurationService, extensionManifestPropertiesService) {
            super('extensions.install', '', `${SystemDisabledWarningAction.CLASS} hide`, false);
            this.extensionManagementServerService = extensionManagementServerService;
            this.labelService = labelService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionService = extensionService;
            this.configurationService = configurationService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.updateWhenCounterExtensionChanges = true;
            this._runningExtensions = null;
            this._register(this.labelService.onDidChangeFormatters(() => this.update(), this));
            this._register(this.extensionService.onDidChangeExtensions(this.updateRunningExtensions, this));
            this.updateRunningExtensions();
            this.update();
        }
        updateRunningExtensions() {
            this.extensionService.getExtensions().then(runningExtensions => { this._runningExtensions = runningExtensions; this.update(); });
        }
        update() {
            this.class = `${SystemDisabledWarningAction.CLASS} hide`;
            this.tooltip = '';
            if (!this.extension ||
                !this.extension.local ||
                !this.extension.server ||
                !this._runningExtensions ||
                this.extension.state !== 1 /* Installed */) {
                return;
            }
            if (this.extension.enablementState === 3 /* DisabledByVirtualWorkspace */) {
                this.class = `${SystemDisabledWarningAction.INFO_CLASS}`;
                this.tooltip = (0, nls_1.localize)(114, null);
                return;
            }
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                if ((0, extensions_2.isLanguagePackExtension)(this.extension.local.manifest)) {
                    if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                        this.class = `${SystemDisabledWarningAction.INFO_CLASS}`;
                        this.tooltip = this.extension.server === this.extensionManagementServerService.localExtensionManagementServer
                            ? (0, nls_1.localize)(115, null, this.extensionManagementServerService.remoteExtensionManagementServer.label)
                            : (0, nls_1.localize)(116, null);
                    }
                    return;
                }
            }
            if (this.extension.enablementState === 1 /* DisabledByExtensionKind */) {
                if (!this.extensionsWorkbenchService.installed.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                    const server = this.extensionManagementServerService.localExtensionManagementServer === this.extension.server ? this.extensionManagementServerService.remoteExtensionManagementServer : this.extensionManagementServerService.localExtensionManagementServer;
                    this.class = `${SystemDisabledWarningAction.WARNING_CLASS}`;
                    if (server) {
                        this.tooltip = (0, nls_1.localize)(117, null, server.label);
                    }
                    else {
                        this.tooltip = (0, nls_1.localize)(118, null);
                    }
                    return;
                }
            }
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                const runningExtension = this._runningExtensions.filter(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                const runningExtensionServer = runningExtension ? this.extensionManagementServerService.getExtensionManagementServer((0, extensions_3.toExtension)(runningExtension)) : null;
                if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                        this.class = `${SystemDisabledWarningAction.INFO_CLASS}`;
                        this.tooltip = (0, nls_1.localize)(119, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
                    }
                    return;
                }
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                        this.class = `${SystemDisabledWarningAction.INFO_CLASS}`;
                        this.tooltip = (0, nls_1.localize)(120, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
                    }
                    return;
                }
            }
            if ((0, workspaceTrust_1.isWorkspaceTrustEnabled)(this.configurationService) && this.extension.enablementState === 0 /* DisabledByTrustRequirement */) {
                this.class = `${SystemDisabledWarningAction.TRUST_CLASS}`;
                this.tooltip = (0, nls_1.localize)(121, null);
                return;
            }
        }
        run() {
            return Promise.resolve(null);
        }
    };
    SystemDisabledWarningAction.CLASS = `${ExtensionAction.ICON_ACTION_CLASS} system-disable`;
    SystemDisabledWarningAction.WARNING_CLASS = `${SystemDisabledWarningAction.CLASS} ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.warningIcon)}`;
    SystemDisabledWarningAction.INFO_CLASS = `${SystemDisabledWarningAction.CLASS} ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.infoIcon)}`;
    SystemDisabledWarningAction.TRUST_CLASS = `${SystemDisabledWarningAction.CLASS} ${themeService_1.ThemeIcon.asClassName(extensionsIcons_1.trustIcon)}`;
    SystemDisabledWarningAction = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, label_1.ILabelService),
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, extensions_3.IExtensionService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], SystemDisabledWarningAction);
    exports.SystemDisabledWarningAction = SystemDisabledWarningAction;
    let ReinstallAction = class ReinstallAction extends actions_1.Action {
        constructor(id = ReinstallAction.ID, label = ReinstallAction.LABEL, extensionsWorkbenchService, quickInputService, notificationService, hostService, instantiationService, extensionService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.filter(l => !l.isBuiltin && l.local).length > 0;
        }
        run() {
            return this.quickInputService.pick(this.getEntries(), { placeHolder: (0, nls_1.localize)(123, null) })
                .then(pick => pick && this.reinstallExtension(pick.extension));
        }
        getEntries() {
            return this.extensionsWorkbenchService.queryLocal()
                .then(local => {
                const entries = local
                    .filter(extension => !extension.isBuiltin)
                    .map(extension => {
                    return {
                        id: extension.identifier.id,
                        label: extension.displayName,
                        description: extension.identifier.id,
                        extension,
                    };
                });
                return entries;
            });
        }
        reinstallExtension(extension) {
            return this.instantiationService.createInstance(SearchExtensionsAction, '@installed ').run()
                .then(() => {
                return this.extensionsWorkbenchService.reinstall(extension)
                    .then(extension => {
                    const requireReload = !(extension.local && this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                    const message = requireReload ? (0, nls_1.localize)(124, null, extension.identifier.id)
                        : (0, nls_1.localize)(125, null, extension.identifier.id);
                    const actions = requireReload ? [{
                            label: (0, nls_1.localize)(126, null),
                            run: () => this.hostService.reload()
                        }] : [];
                    this.notificationService.prompt(notification_1.Severity.Info, message, actions, { sticky: true });
                }, error => this.notificationService.error(error));
            });
        }
    };
    ReinstallAction.ID = 'workbench.extensions.action.reinstall';
    ReinstallAction.LABEL = (0, nls_1.localize)(122, null);
    ReinstallAction = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, notification_1.INotificationService),
        __param(5, host_1.IHostService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, extensions_3.IExtensionService)
    ], ReinstallAction);
    exports.ReinstallAction = ReinstallAction;
    let InstallSpecificVersionOfExtensionAction = class InstallSpecificVersionOfExtensionAction extends actions_1.Action {
        constructor(id = InstallSpecificVersionOfExtensionAction.ID, label = InstallSpecificVersionOfExtensionAction.LABEL, extensionsWorkbenchService, extensionGalleryService, quickInputService, notificationService, hostService, instantiationService, extensionService, extensionEnablementService) {
            super(id, label);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.instantiationService = instantiationService;
            this.extensionService = extensionService;
            this.extensionEnablementService = extensionEnablementService;
        }
        get enabled() {
            return this.extensionsWorkbenchService.local.some(l => this.isEnabled(l));
        }
        async run() {
            const extensionPick = await this.quickInputService.pick(this.getExtensionEntries(), { placeHolder: (0, nls_1.localize)(128, null), matchOnDetail: true });
            if (extensionPick && extensionPick.extension) {
                const versionPick = await this.quickInputService.pick(extensionPick.versions.map(v => ({ id: v.version, label: v.version, description: `${getRelativeDateLabel(new Date(Date.parse(v.date)))}${v.version === extensionPick.extension.version ? ` (${(0, nls_1.localize)(129, null)})` : ''}` })), { placeHolder: (0, nls_1.localize)(130, null), matchOnDetail: true });
                if (versionPick) {
                    if (extensionPick.extension.version !== versionPick.id) {
                        await this.install(extensionPick.extension, versionPick.id);
                    }
                }
            }
        }
        isEnabled(extension) {
            return !!extension.gallery && !!extension.local && this.extensionEnablementService.isEnabled(extension.local);
        }
        async getExtensionEntries() {
            const installed = await this.extensionsWorkbenchService.queryLocal();
            const versionsPromises = [];
            for (const extension of installed) {
                if (this.isEnabled(extension)) {
                    versionsPromises.push(this.extensionGalleryService.getAllVersions(extension.gallery, true)
                        .then(versions => (versions.length ? { extension, versions } : null)));
                }
            }
            const extensions = await Promise.all(versionsPromises);
            return (0, arrays_1.coalesce)(extensions)
                .sort((e1, e2) => e1.extension.displayName.localeCompare(e2.extension.displayName))
                .map(({ extension, versions }) => {
                return {
                    id: extension.identifier.id,
                    label: extension.displayName || extension.identifier.id,
                    description: extension.identifier.id,
                    extension,
                    versions
                };
            });
        }
        install(extension, version) {
            return this.instantiationService.createInstance(SearchExtensionsAction, '@installed ').run()
                .then(() => {
                return this.extensionsWorkbenchService.installVersion(extension, version)
                    .then(extension => {
                    const requireReload = !(extension.local && this.extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                    const message = requireReload ? (0, nls_1.localize)(131, null, extension.identifier.id)
                        : (0, nls_1.localize)(132, null, extension.identifier.id);
                    const actions = requireReload ? [{
                            label: (0, nls_1.localize)(133, null),
                            run: () => this.hostService.reload()
                        }] : [];
                    this.notificationService.prompt(notification_1.Severity.Info, message, actions, { sticky: true });
                }, error => this.notificationService.error(error));
            });
        }
    };
    InstallSpecificVersionOfExtensionAction.ID = 'workbench.extensions.action.install.specificVersion';
    InstallSpecificVersionOfExtensionAction.LABEL = (0, nls_1.localize)(127, null);
    InstallSpecificVersionOfExtensionAction = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, notification_1.INotificationService),
        __param(6, host_1.IHostService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, extensions_3.IExtensionService),
        __param(9, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], InstallSpecificVersionOfExtensionAction);
    exports.InstallSpecificVersionOfExtensionAction = InstallSpecificVersionOfExtensionAction;
    let AbstractInstallExtensionsInServerAction = class AbstractInstallExtensionsInServerAction extends actions_1.Action {
        constructor(id, extensionsWorkbenchService, quickInputService, notificationService, progressService) {
            super(id);
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.extensions = undefined;
            this.update();
            this.extensionsWorkbenchService.queryLocal().then(() => this.updateExtensions());
            this._register(this.extensionsWorkbenchService.onChange(() => {
                if (this.extensions) {
                    this.updateExtensions();
                }
            }));
        }
        updateExtensions() {
            this.extensions = this.extensionsWorkbenchService.local;
            this.update();
        }
        update() {
            this.enabled = !!this.extensions && this.getExtensionsToInstall(this.extensions).length > 0;
            this.tooltip = this.label;
        }
        async run() {
            return this.selectAndInstallExtensions();
        }
        async queryExtensionsToInstall() {
            const local = await this.extensionsWorkbenchService.queryLocal();
            return this.getExtensionsToInstall(local);
        }
        async selectAndInstallExtensions() {
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.busy = true;
            const disposable = quickPick.onDidAccept(() => {
                disposable.dispose();
                quickPick.hide();
                quickPick.dispose();
                this.onDidAccept(quickPick.selectedItems);
            });
            quickPick.show();
            const localExtensionsToInstall = await this.queryExtensionsToInstall();
            quickPick.busy = false;
            if (localExtensionsToInstall.length) {
                quickPick.title = this.getQuickPickTitle();
                quickPick.placeholder = (0, nls_1.localize)(134, null);
                quickPick.canSelectMany = true;
                localExtensionsToInstall.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                quickPick.items = localExtensionsToInstall.map(extension => ({ extension, label: extension.displayName, description: extension.version }));
            }
            else {
                quickPick.hide();
                quickPick.dispose();
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(135, null)
                });
            }
        }
        async onDidAccept(selectedItems) {
            if (selectedItems.length) {
                const localExtensionsToInstall = selectedItems.filter(r => !!r.extension).map(r => r.extension);
                if (localExtensionsToInstall.length) {
                    await this.progressService.withProgress({
                        location: 15 /* Notification */,
                        title: (0, nls_1.localize)(136, null)
                    }, () => this.installExtensions(localExtensionsToInstall));
                    this.notificationService.info((0, nls_1.localize)(137, null));
                }
            }
        }
    };
    AbstractInstallExtensionsInServerAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, progress_1.IProgressService)
    ], AbstractInstallExtensionsInServerAction);
    exports.AbstractInstallExtensionsInServerAction = AbstractInstallExtensionsInServerAction;
    let InstallLocalExtensionsInRemoteAction = class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
        constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, instantiationService) {
            super('workbench.extensions.actions.installLocalExtensionsInRemote', extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.instantiationService = instantiationService;
        }
        get label() {
            if (this.extensionManagementServerService && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return (0, nls_1.localize)(138, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
            }
            return '';
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)(139, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => {
                const action = this.instantiationService.createInstance(RemoteInstallAction, true);
                action.extension = extension;
                return action.enabled;
            });
        }
        async installExtensions(localExtensionsToInstall) {
            const galleryExtensions = [];
            const vsixs = [];
            await async_1.Promises.settled(localExtensionsToInstall.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = await this.extensionGalleryService.getCompatibleExtension(extension.identifier, extension.version);
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
        }
    };
    InstallLocalExtensionsInRemoteAction = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, quickInput_1.IQuickInputService),
        __param(2, progress_1.IProgressService),
        __param(3, notification_1.INotificationService),
        __param(4, extensionManagement_2.IExtensionManagementServerService),
        __param(5, extensionManagement_1.IExtensionGalleryService),
        __param(6, instantiation_1.IInstantiationService)
    ], InstallLocalExtensionsInRemoteAction);
    exports.InstallLocalExtensionsInRemoteAction = InstallLocalExtensionsInRemoteAction;
    let InstallRemoteExtensionsInLocalAction = class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
        constructor(id, extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService) {
            super(id, extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
        }
        get label() {
            return (0, nls_1.localize)(140, null);
        }
        getQuickPickTitle() {
            return (0, nls_1.localize)(141, null);
        }
        getExtensionsToInstall(local) {
            return local.filter(extension => extension.type === 1 /* User */ && extension.server !== this.extensionManagementServerService.localExtensionManagementServer
                && !this.extensionsWorkbenchService.installed.some(e => e.server === this.extensionManagementServerService.localExtensionManagementServer && (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier)));
        }
        async installExtensions(extensions) {
            const galleryExtensions = [];
            const vsixs = [];
            await async_1.Promises.settled(extensions.map(async (extension) => {
                if (this.extensionGalleryService.isEnabled()) {
                    const gallery = await this.extensionGalleryService.getCompatibleExtension(extension.identifier, extension.version);
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            await async_1.Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.install(vsix)));
        }
    };
    InstallRemoteExtensionsInLocalAction = __decorate([
        __param(1, extensions_1.IExtensionsWorkbenchService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, progress_1.IProgressService),
        __param(4, notification_1.INotificationService),
        __param(5, extensionManagement_2.IExtensionManagementServerService),
        __param(6, extensionManagement_1.IExtensionGalleryService)
    ], InstallRemoteExtensionsInLocalAction);
    exports.InstallRemoteExtensionsInLocalAction = InstallRemoteExtensionsInLocalAction;
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
        const viewletService = accessor.get(viewlet_1.IViewletService);
        return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
            .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
            .then(viewlet => {
            viewlet.search(`ext:${fileExtension.replace(/^\./, '')}`);
            viewlet.focus();
        });
    });
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsWithIds', function (accessor, extensionIds) {
        const viewletService = accessor.get(viewlet_1.IViewletService);
        return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
            .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
            .then(viewlet => {
            const query = extensionIds
                .map(id => `@id:${id}`)
                .join(' ');
            viewlet.search(query);
            viewlet.focus();
        });
    });
    exports.extensionButtonProminentBackground = (0, colorRegistry_1.registerColor)('extensionButton.prominentBackground', {
        dark: colorRegistry_1.buttonBackground,
        light: colorRegistry_1.buttonBackground,
        hc: null
    }, (0, nls_1.localize)(142, null));
    exports.extensionButtonProminentForeground = (0, colorRegistry_1.registerColor)('extensionButton.prominentForeground', {
        dark: colorRegistry_1.buttonForeground,
        light: colorRegistry_1.buttonForeground,
        hc: null
    }, (0, nls_1.localize)(143, null));
    exports.extensionButtonProminentHoverBackground = (0, colorRegistry_1.registerColor)('extensionButton.prominentHoverBackground', {
        dark: colorRegistry_1.buttonHoverBackground,
        light: colorRegistry_1.buttonHoverBackground,
        hc: null
    }, (0, nls_1.localize)(144, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action.built-in-status { border-color: ${foregroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action.built-in-status { border-color: ${foregroundColor}; }`);
        }
        const buttonBackgroundColor = theme.getColor(colorRegistry_1.buttonBackground);
        if (buttonBackgroundColor) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action.label { background-color: ${buttonBackgroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action.label { background-color: ${buttonBackgroundColor}; }`);
        }
        const buttonForegroundColor = theme.getColor(colorRegistry_1.buttonForeground);
        if (buttonForegroundColor) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action.label { color: ${buttonForegroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action.label { color: ${buttonForegroundColor}; }`);
        }
        const buttonHoverBackgroundColor = theme.getColor(colorRegistry_1.buttonHoverBackground);
        if (buttonHoverBackgroundColor) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item:hover .action-label.extension-action.label { background-color: ${buttonHoverBackgroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item:hover .action-label.extension-action.label { background-color: ${buttonHoverBackgroundColor}; }`);
        }
        const extensionButtonProminentBackgroundColor = theme.getColor(exports.extensionButtonProminentBackground);
        if (exports.extensionButtonProminentBackground) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action.label.prominent { background-color: ${extensionButtonProminentBackgroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action.label.prominent { background-color: ${extensionButtonProminentBackgroundColor}; }`);
        }
        const extensionButtonProminentForegroundColor = theme.getColor(exports.extensionButtonProminentForeground);
        if (exports.extensionButtonProminentForeground) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action.label.prominent { color: ${extensionButtonProminentForegroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action.label.prominent { color: ${extensionButtonProminentForegroundColor}; }`);
        }
        const extensionButtonProminentHoverBackgroundColor = theme.getColor(exports.extensionButtonProminentHoverBackground);
        if (exports.extensionButtonProminentHoverBackground) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item:hover .action-label.extension-action.label.prominent { background-color: ${extensionButtonProminentHoverBackgroundColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item:hover .action-label.extension-action.label.prominent { background-color: ${extensionButtonProminentHoverBackgroundColor}; }`);
        }
        const contrastBorderColor = theme.getColor(colorRegistry_1.contrastBorder);
        if (contrastBorderColor) {
            collector.addRule(`.extension-list-item .monaco-action-bar .action-item .action-label.extension-action:not(.disabled) { border: 1px solid ${contrastBorderColor}; }`);
            collector.addRule(`.extension-editor .monaco-action-bar .action-item .action-label.extension-action:not(.disabled) { border: 1px solid ${contrastBorderColor}; }`);
        }
    });
});
//# sourceMappingURL=extensionsActions.js.map