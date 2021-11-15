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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/base/common/actions", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/extensions/common/extensions", "vs/platform/list/browser/listService", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/contextview/browser/contextView", "vs/base/common/decorators", "vs/base/common/arrays", "vs/base/common/event", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/label/common/label", "vs/base/browser/ui/iconLabel/iconLabels", "vs/platform/extensions/common/extensions", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/platform/theme/common/colorRegistry", "vs/base/browser/event", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/css!./media/runtimeExtensionsEditor"], function (require, exports, nls, actions_1, editorPane_1, telemetry_1, instantiation_1, extensions_1, themeService_1, extensions_2, listService_1, dom_1, actionbar_1, lifecycle_1, async_1, contextView_1, decorators_1, arrays_1, event_1, notification_1, contextkey_1, storage_1, label_1, iconLabels_1, extensions_3, network_1, environmentService_1, colorRegistry_1, event_2, editorService_1, runtimeExtensionsInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowRuntimeExtensionsAction = exports.AbstractRuntimeExtensionsEditor = void 0;
    let AbstractRuntimeExtensionsEditor = class AbstractRuntimeExtensionsEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, themeService, contextKeyService, _extensionsWorkbenchService, _extensionService, _notificationService, _contextMenuService, _instantiationService, storageService, _labelService, _environmentService) {
            super(AbstractRuntimeExtensionsEditor.ID, telemetryService, themeService, storageService);
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._extensionService = _extensionService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._instantiationService = _instantiationService;
            this._labelService = _labelService;
            this._environmentService = _environmentService;
            this._list = null;
            this._elements = null;
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this._updateExtensions(), 200));
            this._register(this._extensionService.onDidChangeExtensionsStatus(() => this._updateSoon.schedule()));
            this._updateExtensions();
        }
        async _updateExtensions() {
            this._elements = await this._resolveExtensions();
            if (this._list) {
                this._list.splice(0, this._list.length, this._elements);
            }
        }
        async _resolveExtensions() {
            // We only deal with extensions with source code!
            const extensionsDescriptions = (await this._extensionService.getExtensions()).filter((extension) => {
                return Boolean(extension.main) || Boolean(extension.browser);
            });
            let marketplaceMap = Object.create(null);
            const marketPlaceExtensions = await this._extensionsWorkbenchService.queryLocal();
            for (let extension of marketPlaceExtensions) {
                marketplaceMap[extensions_3.ExtensionIdentifier.toKey(extension.identifier.id)] = extension;
            }
            let statusMap = this._extensionService.getExtensionsStatus();
            // group profile segments by extension
            let segments = Object.create(null);
            const profileInfo = this._getProfileInfo();
            if (profileInfo) {
                let currentStartTime = profileInfo.startTime;
                for (let i = 0, len = profileInfo.deltas.length; i < len; i++) {
                    const id = profileInfo.ids[i];
                    const delta = profileInfo.deltas[i];
                    let extensionSegments = segments[extensions_3.ExtensionIdentifier.toKey(id)];
                    if (!extensionSegments) {
                        extensionSegments = [];
                        segments[extensions_3.ExtensionIdentifier.toKey(id)] = extensionSegments;
                    }
                    extensionSegments.push(currentStartTime);
                    currentStartTime = currentStartTime + delta;
                    extensionSegments.push(currentStartTime);
                }
            }
            let result = [];
            for (let i = 0, len = extensionsDescriptions.length; i < len; i++) {
                const extensionDescription = extensionsDescriptions[i];
                let extProfileInfo = null;
                if (profileInfo) {
                    let extensionSegments = segments[extensions_3.ExtensionIdentifier.toKey(extensionDescription.identifier)] || [];
                    let extensionTotalTime = 0;
                    for (let j = 0, lenJ = extensionSegments.length / 2; j < lenJ; j++) {
                        const startTime = extensionSegments[2 * j];
                        const endTime = extensionSegments[2 * j + 1];
                        extensionTotalTime += (endTime - startTime);
                    }
                    extProfileInfo = {
                        segments: extensionSegments,
                        totalTime: extensionTotalTime
                    };
                }
                result[i] = {
                    originalIndex: i,
                    description: extensionDescription,
                    marketplaceInfo: marketplaceMap[extensions_3.ExtensionIdentifier.toKey(extensionDescription.identifier)],
                    status: statusMap[extensionDescription.identifier.value],
                    profileInfo: extProfileInfo || undefined,
                    unresponsiveProfile: this._getUnresponsiveProfile(extensionDescription.identifier)
                };
            }
            result = result.filter(element => element.status.activationTimes);
            // bubble up extensions that have caused slowness
            const isUnresponsive = (extension) => extension.unresponsiveProfile === profileInfo;
            const profileTime = (extension) => { var _a, _b; return (_b = (_a = extension.profileInfo) === null || _a === void 0 ? void 0 : _a.totalTime) !== null && _b !== void 0 ? _b : 0; };
            const activationTime = (extension) => {
                var _a, _b, _c, _d;
                return ((_b = (_a = extension.status.activationTimes) === null || _a === void 0 ? void 0 : _a.codeLoadingTime) !== null && _b !== void 0 ? _b : 0) +
                    ((_d = (_c = extension.status.activationTimes) === null || _c === void 0 ? void 0 : _c.activateCallTime) !== null && _d !== void 0 ? _d : 0);
            };
            result = result.sort((a, b) => {
                if (isUnresponsive(a) || isUnresponsive(b)) {
                    return +isUnresponsive(b) - +isUnresponsive(a);
                }
                else if (profileTime(a) || profileTime(b)) {
                    return profileTime(b) - profileTime(a);
                }
                else if (activationTime(a) || activationTime(b)) {
                    return activationTime(b) - activationTime(a);
                }
                return a.originalIndex - b.originalIndex;
            });
            return result;
        }
        createEditor(parent) {
            parent.classList.add('runtime-extensions-editor');
            const TEMPLATE_ID = 'runtimeExtensionElementTemplate';
            const delegate = new class {
                getHeight(element) {
                    return 62;
                }
                getTemplateId(element) {
                    return TEMPLATE_ID;
                }
            };
            const renderer = {
                templateId: TEMPLATE_ID,
                renderTemplate: (root) => {
                    const element = (0, dom_1.append)(root, (0, dom_1.$)('.extension'));
                    const iconContainer = (0, dom_1.append)(element, (0, dom_1.$)('.icon-container'));
                    const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon'));
                    const desc = (0, dom_1.append)(element, (0, dom_1.$)('div.desc'));
                    const headerContainer = (0, dom_1.append)(desc, (0, dom_1.$)('.header-container'));
                    const header = (0, dom_1.append)(headerContainer, (0, dom_1.$)('.header'));
                    const name = (0, dom_1.append)(header, (0, dom_1.$)('div.name'));
                    const version = (0, dom_1.append)(header, (0, dom_1.$)('span.version'));
                    const msgContainer = (0, dom_1.append)(desc, (0, dom_1.$)('div.msg'));
                    const actionbar = new actionbar_1.ActionBar(desc, { animated: false });
                    actionbar.onDidRun(({ error }) => error && this._notificationService.error(error));
                    const timeContainer = (0, dom_1.append)(element, (0, dom_1.$)('.time'));
                    const activationTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.activation-time'));
                    const profileTime = (0, dom_1.append)(timeContainer, (0, dom_1.$)('div.profile-time'));
                    const disposables = [actionbar];
                    return {
                        root,
                        element,
                        icon,
                        name,
                        version,
                        actionbar,
                        activationTime,
                        profileTime,
                        msgContainer,
                        disposables,
                        elementDisposables: [],
                    };
                },
                renderElement: (element, index, data) => {
                    data.elementDisposables = (0, lifecycle_1.dispose)(data.elementDisposables);
                    data.root.classList.toggle('odd', index % 2 === 1);
                    const onError = event_1.Event.once((0, event_2.domEvent)(data.icon, 'error'));
                    onError(() => data.icon.src = element.marketplaceInfo.iconUrlFallback, null, data.elementDisposables);
                    data.icon.src = element.marketplaceInfo.iconUrl;
                    if (!data.icon.complete) {
                        data.icon.style.visibility = 'hidden';
                        data.icon.onload = () => data.icon.style.visibility = 'inherit';
                    }
                    else {
                        data.icon.style.visibility = 'inherit';
                    }
                    data.name.textContent = element.marketplaceInfo.displayName;
                    data.version.textContent = element.description.version;
                    const activationTimes = element.status.activationTimes;
                    let syncTime = activationTimes.codeLoadingTime + activationTimes.activateCallTime;
                    data.activationTime.textContent = activationTimes.activationReason.startup ? `Startup Activation: ${syncTime}ms` : `Activation: ${syncTime}ms`;
                    data.actionbar.clear();
                    const slowExtensionAction = this._createSlowExtensionAction(element);
                    if (slowExtensionAction) {
                        data.actionbar.push(slowExtensionAction, { icon: true, label: true });
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const reportExtensionIssueAction = this._createReportExtensionIssueAction(element);
                        if (reportExtensionIssueAction) {
                            data.actionbar.push(reportExtensionIssueAction, { icon: true, label: true });
                        }
                    }
                    let title;
                    const activationId = activationTimes.activationReason.extensionId.value;
                    const activationEvent = activationTimes.activationReason.activationEvent;
                    if (activationEvent === '*') {
                        title = nls.localize(0, null, activationId);





                    }
                    else if (/^workspaceContains:/.test(activationEvent)) {
                        let fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
                        if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0) {
                            title = nls.localize(1, null, fileNameOrGlob, activationId);






                        }
                        else {
                            title = nls.localize(2, null, fileNameOrGlob, activationId);






                        }
                    }
                    else if (/^workspaceContainsTimeout:/.test(activationEvent)) {
                        const glob = activationEvent.substr('workspaceContainsTimeout:'.length);
                        title = nls.localize(3, null, glob, activationId);






                    }
                    else if (activationEvent === 'onStartupFinished') {
                        title = nls.localize(4, null, activationId);





                    }
                    else if (/^onLanguage:/.test(activationEvent)) {
                        let language = activationEvent.substr('onLanguage:'.length);
                        title = nls.localize(5, null, language, activationId);
                    }
                    else {
                        title = nls.localize(6, null, activationEvent, activationId);






                    }
                    data.activationTime.title = title;
                    (0, dom_1.clearNode)(data.msgContainer);
                    if (this._getUnresponsiveProfile(element.description.identifier)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(` $(alert) Unresponsive`));
                        el.title = nls.localize(7, null);
                        data.msgContainer.appendChild(el);
                    }
                    if ((0, arrays_1.isNonEmptyArray)(element.status.runtimeErrors)) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(bug) ${nls.localize(8, null, element.status.runtimeErrors.length)}`));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.status.messages && element.status.messages.length > 0) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(alert) ${element.status.messages[0].message}`));
                        data.msgContainer.appendChild(el);
                    }
                    if (element.description.extensionLocation.scheme === network_1.Schemas.vscodeRemote) {
                        const el = (0, dom_1.$)('span', undefined, ...(0, iconLabels_1.renderLabelWithIcons)(`$(remote) ${element.description.extensionLocation.authority}`));
                        data.msgContainer.appendChild(el);
                        const hostLabel = this._labelService.getHostLabel(network_1.Schemas.vscodeRemote, this._environmentService.remoteAuthority);
                        if (hostLabel) {
                            (0, dom_1.reset)(el, ...(0, iconLabels_1.renderLabelWithIcons)(`$(remote) ${hostLabel}`));
                        }
                    }
                    if (element.profileInfo) {
                        data.profileTime.textContent = `Profile: ${(element.profileInfo.totalTime / 1000).toFixed(2)}ms`;
                    }
                    else {
                        data.profileTime.textContent = '';
                    }
                },
                disposeTemplate: (data) => {
                    data.disposables = (0, lifecycle_1.dispose)(data.disposables);
                }
            };
            this._list = this._instantiationService.createInstance(listService_1.WorkbenchList, 'RuntimeExtensions', parent, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground
                },
                accessibilityProvider: new class {
                    getWidgetAriaLabel() {
                        return nls.localize(9, null);
                    }
                    getAriaLabel(element) {
                        return element.description.name;
                    }
                }
            });
            this._list.splice(0, this._list.length, this._elements || undefined);
            this._list.onContextMenu((e) => {
                if (!e.element) {
                    return;
                }
                const actions = [];
                const reportExtensionIssueAction = this._createReportExtensionIssueAction(e.element);
                if (reportExtensionIssueAction) {
                    actions.push(reportExtensionIssueAction);
                    actions.push(new actions_1.Separator());
                }
                actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disableWorkspace', nls.localize(10, null), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 5 /* DisabledWorkspace */)));
                actions.push(new actions_1.Action('runtimeExtensionsEditor.action.disable', nls.localize(11, null), undefined, true, () => this._extensionsWorkbenchService.setEnablement(e.element.marketplaceInfo, 4 /* DisabledGlobally */)));
                actions.push(new actions_1.Separator());
                const profileAction = this._createProfileAction();
                if (profileAction) {
                    actions.push(profileAction);
                }
                const saveExtensionHostProfileAction = this.saveExtensionHostProfileAction;
                if (saveExtensionHostProfileAction) {
                    actions.push(saveExtensionHostProfileAction);
                }
                this._contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions
                });
            });
        }
        get saveExtensionHostProfileAction() {
            return this._createSaveExtensionHostProfileAction();
        }
        layout(dimension) {
            if (this._list) {
                this._list.layout(dimension.height);
            }
        }
    };
    AbstractRuntimeExtensionsEditor.ID = 'workbench.editor.runtimeExtensions';
    __decorate([
        decorators_1.memoize
    ], AbstractRuntimeExtensionsEditor.prototype, "saveExtensionHostProfileAction", null);
    AbstractRuntimeExtensionsEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensions_2.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService)
    ], AbstractRuntimeExtensionsEditor);
    exports.AbstractRuntimeExtensionsEditor = AbstractRuntimeExtensionsEditor;
    let ShowRuntimeExtensionsAction = class ShowRuntimeExtensionsAction extends actions_1.Action {
        constructor(id, label, _editorService) {
            super(id, label);
            this._editorService = _editorService;
        }
        async run(e) {
            await this._editorService.openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { revealIfOpened: true, pinned: true });
        }
    };
    ShowRuntimeExtensionsAction.ID = 'workbench.action.showRuntimeExtensions';
    ShowRuntimeExtensionsAction.LABEL = nls.localize(12, null);
    ShowRuntimeExtensionsAction = __decorate([
        __param(2, editorService_1.IEditorService)
    ], ShowRuntimeExtensionsAction);
    exports.ShowRuntimeExtensionsAction = ShowRuntimeExtensionsAction;
});
//# sourceMappingURL=abstractRuntimeExtensionsEditor.js.map