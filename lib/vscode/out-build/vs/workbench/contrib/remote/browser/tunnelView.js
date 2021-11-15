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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/tunnelView", "vs/base/browser/dom", "vs/workbench/common/views", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/commands/common/commands", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/clipboard/common/clipboardService", "vs/platform/notification/common/notification", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/theme/common/styler", "vs/base/common/functional", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/base/common/uri", "vs/platform/remote/common/tunnel", "vs/platform/instantiation/common/descriptors", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/remote/browser/remoteIcons", "vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService", "vs/base/common/cancellation", "vs/base/common/platform", "vs/platform/list/browser/listService", "vs/base/browser/ui/button/button", "vs/platform/theme/common/colorRegistry", "vs/base/common/htmlContent", "vs/workbench/services/hover/browser/hover", "vs/workbench/common/theme", "vs/css!./media/tunnelView"], function (require, exports, nls, dom, views_1, keybinding_1, contextView_1, contextkey_1, configuration_1, instantiation_1, opener_1, quickInput_1, commands_1, event_1, lifecycle_1, actionbar_1, iconLabel_1, actions_1, actions_2, menuEntryActionViewItem_1, remoteExplorerService_1, clipboardService_1, notification_1, inputBox_1, styler_1, functional_1, themeService_1, viewPane_1, uri_1, tunnel_1, descriptors_1, keybindingsRegistry_1, telemetry_1, actionViewItems_1, remoteIcons_1, externalUriOpenerService_1, cancellation_1, platform_1, listService_1, button_1, colorRegistry_1, htmlContent_1, hover_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.portWithRunningProcessForeground = exports.OpenPortInPreviewAction = exports.OpenPortInBrowserAction = exports.ForwardPortAction = exports.TunnelPanelDescriptor = exports.TunnelPanel = exports.TunnelCloseableContextKey = exports.TunnelTypeContextKey = exports.TunnelViewModel = exports.forwardedPortsViewEnabled = void 0;
    exports.forwardedPortsViewEnabled = new contextkey_1.RawContextKey('forwardedPortsViewEnabled', false, nls.localize(0, null));
    class TunnelTreeVirtualDelegate {
        constructor(remoteExplorerService) {
            this.remoteExplorerService = remoteExplorerService;
            this.headerRowHeight = 22;
        }
        getHeight(row) {
            return (row.tunnelType === remoteExplorerService_1.TunnelType.Add && !this.remoteExplorerService.getEditableData(undefined)) ? 30 : 22;
        }
    }
    let TunnelViewModel = class TunnelViewModel {
        constructor(remoteExplorerService) {
            this.remoteExplorerService = remoteExplorerService;
            this._candidates = new Map();
            this.input = {
                label: nls.localize(1, null),
                icon: undefined,
                tunnelType: remoteExplorerService_1.TunnelType.Add,
                hasRunningProcess: false,
                remoteHost: '',
                remotePort: 0,
                processDescription: '',
                tooltipPostfix: '',
                iconTooltip: '',
                portTooltip: '',
                processTooltip: '',
                originTooltip: '',
                privacyTooltip: '',
                source: ''
            };
            this.model = remoteExplorerService.tunnelModel;
            this.onForwardedPortsChanged = event_1.Event.any(this.model.onForwardPort, this.model.onClosePort, this.model.onPortName, this.model.onCandidatesChanged);
        }
        get all() {
            const result = [];
            this._candidates = new Map();
            this.model.candidates.forEach(candidate => {
                this._candidates.set((0, remoteExplorerService_1.makeAddress)(candidate.host, candidate.port), candidate);
            });
            if ((this.model.forwarded.size > 0) || this.remoteExplorerService.getEditableData(undefined)) {
                result.push(...this.forwarded);
            }
            if (this.model.detected.size > 0) {
                result.push(...this.detected);
            }
            result.push(this.input);
            return result;
        }
        addProcessInfoFromCandidate(tunnelItem) {
            const key = (0, remoteExplorerService_1.makeAddress)(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (this._candidates.has(key)) {
                tunnelItem.processDescription = this._candidates.get(key).detail;
            }
        }
        get forwarded() {
            const forwarded = Array.from(this.model.forwarded.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, tunnel);
                this.addProcessInfoFromCandidate(tunnelItem);
                return tunnelItem;
            }).sort((a, b) => {
                if (a.remotePort === b.remotePort) {
                    return a.remoteHost < b.remoteHost ? -1 : 1;
                }
                else {
                    return a.remotePort < b.remotePort ? -1 : 1;
                }
            });
            return forwarded;
        }
        get detected() {
            return Array.from(this.model.detected.values()).map(tunnel => {
                const tunnelItem = TunnelItem.createFromTunnel(this.remoteExplorerService, tunnel, remoteExplorerService_1.TunnelType.Detected, false);
                this.addProcessInfoFromCandidate(tunnelItem);
                return tunnelItem;
            });
        }
        isEmpty() {
            return (this.detected.length === 0) &&
                ((this.forwarded.length === 0) || (this.forwarded.length === 1 &&
                    (this.forwarded[0].tunnelType === remoteExplorerService_1.TunnelType.Add) && !this.remoteExplorerService.getEditableData(undefined)));
        }
    };
    TunnelViewModel = __decorate([
        __param(0, remoteExplorerService_1.IRemoteExplorerService)
    ], TunnelViewModel);
    exports.TunnelViewModel = TunnelViewModel;
    function emptyCell(item) {
        return { label: '', tunnel: item, editId: remoteExplorerService_1.TunnelEditId.None, tooltip: '' };
    }
    class IconColumn {
        constructor() {
            this.label = '';
            this.tooltip = '';
            this.weight = 1;
            this.minimumWidth = 40;
            this.maximumWidth = 40;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const icon = row.processDescription ? remoteIcons_1.forwardedPortWithProcessIcon : remoteIcons_1.forwardedPortWithoutProcessIcon;
            let tooltip = '';
            if (row instanceof TunnelItem) {
                tooltip = `${row.iconTooltip} ${row.tooltipPostfix}`;
            }
            return {
                label: '', icon, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip
            };
        }
    }
    class PortColumn {
        constructor() {
            this.label = nls.localize(2, null);
            this.tooltip = nls.localize(3, null);
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            const isAdd = row.tunnelType === remoteExplorerService_1.TunnelType.Add;
            const label = row.label;
            let tooltip = '';
            if (row instanceof TunnelItem && !isAdd) {
                tooltip = `${row.portTooltip} ${row.tooltipPostfix}`;
            }
            else {
                tooltip = label;
            }
            return {
                label, tunnel: row, menuId: actions_2.MenuId.TunnelPortInline,
                editId: row.tunnelType === remoteExplorerService_1.TunnelType.Add ? remoteExplorerService_1.TunnelEditId.New : remoteExplorerService_1.TunnelEditId.Label, tooltip
            };
        }
    }
    class LocalAddressColumn {
        constructor() {
            this.label = nls.localize(4, null);
            this.tooltip = nls.localize(5, null);
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            var _a;
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = (_a = row.localAddress) !== null && _a !== void 0 ? _a : '';
            let tooltip = label;
            if (row instanceof TunnelItem) {
                tooltip = row.tooltipPostfix;
            }
            return {
                label,
                menuId: actions_2.MenuId.TunnelLocalAddressInline,
                tunnel: row,
                editId: remoteExplorerService_1.TunnelEditId.LocalPort,
                tooltip,
                markdownTooltip: label ? LocalAddressColumn.getHoverText(label) : undefined
            };
        }
        static getHoverText(localAddress) {
            return function (configurationService) {
                const editorConf = configurationService.getValue('editor');
                let clickLabel = '';
                if (editorConf.multiCursorModifier === 'ctrlCmd') {
                    if (platform_1.isMacintosh) {
                        clickLabel = nls.localize(6, null);
                    }
                    else {
                        clickLabel = nls.localize(7, null);
                    }
                }
                else {
                    if (platform_1.isMacintosh) {
                        clickLabel = nls.localize(8, null);
                    }
                    else {
                        clickLabel = nls.localize(9, null);
                    }
                }
                const markdown = new htmlContent_1.MarkdownString('', true);
                const uri = localAddress.startsWith('http') ? localAddress : `http://${localAddress}`;
                return markdown.appendMarkdown(`[Follow link](${uri}) (${clickLabel})`);
            };
        }
    }
    class RunningProcessColumn {
        constructor() {
            this.label = nls.localize(10, null);
            this.tooltip = nls.localize(11, null);
            this.weight = 2;
            this.templateId = 'actionbar';
        }
        project(row) {
            var _a;
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = (_a = row.processDescription) !== null && _a !== void 0 ? _a : '';
            return { label, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip: row instanceof TunnelItem ? row.processTooltip : '' };
        }
    }
    class OriginColumn {
        constructor() {
            this.label = nls.localize(12, null);
            this.tooltip = nls.localize(13, null);
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.source;
            const tooltip = `${row instanceof TunnelItem ? row.originTooltip : ''}. ${row instanceof TunnelItem ? row.tooltipPostfix : ''}`;
            return { label, menuId: actions_2.MenuId.TunnelOriginInline, tunnel: row, editId: remoteExplorerService_1.TunnelEditId.None, tooltip };
        }
    }
    class PrivacyColumn {
        constructor() {
            this.label = nls.localize(14, null);
            this.tooltip = nls.localize(15, null);
            this.weight = 1;
            this.templateId = 'actionbar';
        }
        project(row) {
            if (row.tunnelType === remoteExplorerService_1.TunnelType.Add) {
                return emptyCell(row);
            }
            const label = row.privacy === remoteExplorerService_1.TunnelPrivacy.Public ? nls.localize(16, null) : nls.localize(17, null);
            let tooltip = '';
            if (row instanceof TunnelItem) {
                tooltip = `${row.privacyTooltip} ${row.tooltipPostfix}`;
            }
            return { label, tunnel: row, icon: row.icon, editId: remoteExplorerService_1.TunnelEditId.None, tooltip };
        }
    }
    let ActionBarRenderer = class ActionBarRenderer extends lifecycle_1.Disposable {
        constructor(instantiationService, contextKeyService, menuService, contextViewService, themeService, remoteExplorerService, commandService, configurationService, hoverService) {
            super();
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.remoteExplorerService = remoteExplorerService;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.hoverService = hoverService;
            this.templateId = 'actionbar';
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        renderTemplate(container) {
            const cell = dom.append(container, dom.$('.ports-view-actionbar-cell'));
            const icon = dom.append(cell, dom.$('.ports-view-actionbar-cell-icon'));
            const label = new iconLabel_1.IconLabel(cell, {
                supportHighlights: true,
                hoverDelegate: {
                    showHover: (options) => {
                        return this.hoverService.showHover(options);
                    },
                    delay: this.configurationService.getValue('workbench.hover.delay')
                }
            });
            const actionsContainer = dom.append(cell, dom.$('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService)
            });
            return { label, icon, actionBar, container: cell, elementDisposable: lifecycle_1.Disposable.None };
        }
        renderElement(element, index, templateData) {
            // reset
            templateData.actionBar.clear();
            templateData.icon.className = 'ports-view-actionbar-cell-icon';
            templateData.icon.style.display = 'none';
            templateData.label.setLabel('');
            templateData.label.element.style.display = 'none';
            if (templateData.button) {
                templateData.button.element.style.display = 'none';
                templateData.button.dispose();
            }
            templateData.container.style.paddingLeft = '0px';
            templateData.elementDisposable.dispose();
            let editableData;
            if (element.editId === remoteExplorerService_1.TunnelEditId.New && (editableData = this.remoteExplorerService.getEditableData(undefined))) {
                this.renderInputBox(templateData.container, editableData);
            }
            else {
                editableData = this.remoteExplorerService.getEditableData(element.tunnel, element.editId);
                if (editableData) {
                    this.renderInputBox(templateData.container, editableData);
                }
                else if ((element.tunnel.tunnelType === remoteExplorerService_1.TunnelType.Add) && (element.menuId === actions_2.MenuId.TunnelPortInline)) {
                    this.renderButton(element, templateData);
                }
                else {
                    this.renderActionBarItem(element, templateData);
                }
            }
        }
        renderButton(element, templateData) {
            templateData.container.style.paddingLeft = '7px';
            templateData.container.style.height = '28px';
            templateData.button = this._register(new button_1.Button(templateData.container));
            templateData.button.label = element.label;
            templateData.button.element.title = element.tooltip;
            this._register((0, styler_1.attachButtonStyler)(templateData.button, this.themeService));
            this._register(templateData.button.onDidClick(() => {
                this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
            }));
        }
        renderActionBarItem(element, templateData) {
            templateData.label.element.style.display = 'flex';
            templateData.label.setLabel(element.label, undefined, {
                title: element.markdownTooltip ?
                    { markdown: element.markdownTooltip(this.configurationService), markdownNotSupportedFallback: element.tooltip }
                    : element.tooltip,
                extraClasses: element.menuId === actions_2.MenuId.TunnelLocalAddressInline ? ['ports-view-actionbar-cell-localaddress'] : undefined
            });
            templateData.actionBar.context = element.tunnel;
            templateData.container.style.paddingLeft = '10px';
            const context = [
                ['view', remoteExplorerService_1.TUNNEL_VIEW_ID],
                [exports.TunnelTypeContextKey.key, element.tunnel.tunnelType],
                [exports.TunnelCloseableContextKey.key, element.tunnel.closeable],
                [TunnelPrivacyContextKey.key, element.tunnel.privacy]
            ];
            const contextKeyService = this.contextKeyService.createOverlay(context);
            const disposableStore = new lifecycle_1.DisposableStore();
            templateData.elementDisposable = disposableStore;
            if (element.menuId) {
                const menu = disposableStore.add(this.menuService.createMenu(element.menuId, contextKeyService));
                let actions = [];
                disposableStore.add((0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, { shouldForwardArgs: true }, actions));
                if (actions) {
                    let labelActions = actions.filter(action => action.id.toLowerCase().indexOf('label') >= 0);
                    if (labelActions.length > 1) {
                        labelActions.sort((a, b) => a.label.length - b.label.length);
                        labelActions.pop();
                        actions = actions.filter(action => labelActions.indexOf(action) < 0);
                    }
                    templateData.actionBar.push(actions, { icon: true, label: false });
                    if (this._actionRunner) {
                        templateData.actionBar.actionRunner = this._actionRunner;
                    }
                }
            }
            if (element.icon) {
                templateData.icon.className = `ports-view-actionbar-cell-icon ${themeService_1.ThemeIcon.asClassName(element.icon)}`;
                templateData.icon.title = element.tooltip;
                templateData.icon.style.display = 'inline';
            }
        }
        renderInputBox(container, editableData) {
            // Required for FireFox. The blur event doesn't fire on FireFox when you just mash the "+" button to forward a port.
            if (this.inputDone) {
                this.inputDone(false, false);
                this.inputDone = undefined;
            }
            container.style.paddingLeft = '5px';
            const value = editableData.startingValue || '';
            const inputBox = new inputBox_1.InputBox(container, this.contextViewService, {
                ariaLabel: nls.localize(18, null),
                validationOptions: {
                    validation: (value) => {
                        const message = editableData.validationMessage(value);
                        if (!message) {
                            return null;
                        }
                        return {
                            content: message.content,
                            formatContent: true,
                            type: message.severity === notification_1.Severity.Error ? 3 /* ERROR */ : 1 /* INFO */
                        };
                    }
                },
                placeholder: editableData.placeholder || ''
            });
            const styler = (0, styler_1.attachInputBoxStyler)(inputBox, this.themeService);
            inputBox.value = value;
            inputBox.focus();
            inputBox.select({ start: 0, end: editableData.startingValue ? editableData.startingValue.length : 0 });
            const done = (0, functional_1.once)(async (success, finishEditing) => {
                (0, lifecycle_1.dispose)(toDispose);
                if (this.inputDone) {
                    this.inputDone = undefined;
                }
                inputBox.element.style.display = 'none';
                const inputValue = inputBox.value;
                if (finishEditing) {
                    return editableData.onFinish(inputValue, success);
                }
            });
            this.inputDone = done;
            const toDispose = [
                inputBox,
                dom.addStandardDisposableListener(inputBox.inputElement, dom.EventType.KEY_DOWN, async (e) => {
                    if (e.equals(3 /* Enter */)) {
                        e.stopPropagation();
                        if (inputBox.validate() !== 3 /* ERROR */) {
                            return done(true, true);
                        }
                        else {
                            return done(false, true);
                        }
                    }
                    else if (e.equals(9 /* Escape */)) {
                        e.preventDefault();
                        e.stopPropagation();
                        return done(false, true);
                    }
                }),
                dom.addDisposableListener(inputBox.inputElement, dom.EventType.BLUR, () => {
                    return done(inputBox.validate() !== 3 /* ERROR */, true);
                }),
                styler
            ];
            return (0, lifecycle_1.toDisposable)(() => {
                done(false, false);
            });
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposable.dispose();
        }
        disposeTemplate(templateData) {
            var _a;
            templateData.label.dispose();
            templateData.actionBar.dispose();
            templateData.elementDisposable.dispose();
            (_a = templateData.button) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    };
    ActionBarRenderer = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, actions_2.IMenuService),
        __param(3, contextView_1.IContextViewService),
        __param(4, themeService_1.IThemeService),
        __param(5, remoteExplorerService_1.IRemoteExplorerService),
        __param(6, commands_1.ICommandService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, hover_1.IHoverService)
    ], ActionBarRenderer);
    class TunnelItem {
        constructor(tunnelType, remoteHost, remotePort, source, hasRunningProcess, localAddress, localPort, closeable, name, runningProcess, pid, privacy, remoteExplorerService) {
            this.tunnelType = tunnelType;
            this.remoteHost = remoteHost;
            this.remotePort = remotePort;
            this.source = source;
            this.hasRunningProcess = hasRunningProcess;
            this.localAddress = localAddress;
            this.localPort = localPort;
            this.closeable = closeable;
            this.name = name;
            this.runningProcess = runningProcess;
            this.pid = pid;
            this.privacy = privacy;
            this.remoteExplorerService = remoteExplorerService;
        }
        static createFromTunnel(remoteExplorerService, tunnel, type = remoteExplorerService_1.TunnelType.Forwarded, closeable) {
            var _a;
            return new TunnelItem(type, tunnel.remoteHost, tunnel.remotePort, (_a = tunnel.source) !== null && _a !== void 0 ? _a : (tunnel.userForwarded ? nls.localize(19, null) :
                (type === remoteExplorerService_1.TunnelType.Detected ? nls.localize(20, null) : nls.localize(21, null))), !!tunnel.hasRunningProcess, tunnel.localAddress, tunnel.localPort, closeable === undefined ? tunnel.closeable : closeable, tunnel.name, tunnel.runningProcess, tunnel.pid, tunnel.privacy, remoteExplorerService);
        }
        get label() {
            if (this.tunnelType === remoteExplorerService_1.TunnelType.Add && this.name) {
                return this.name;
            }
            else if (this.name) {
                return `${this.name} (${this.remotePort})`;
            }
            else {
                return `${this.remotePort}`;
            }
        }
        set processDescription(description) {
            this.runningProcess = description;
        }
        get processDescription() {
            var _a;
            let description = '';
            if (this.runningProcess) {
                if (this.pid && ((_a = this.remoteExplorerService) === null || _a === void 0 ? void 0 : _a.namedProcesses.has(this.pid))) {
                    // This is a known process. Give it a friendly name.
                    description = this.remoteExplorerService.namedProcesses.get(this.pid);
                }
                else {
                    description = this.runningProcess.replace(/\0/g, ' ').trim();
                }
                if (this.pid) {
                    description += ` (${this.pid})`;
                }
            }
            else if (this.hasRunningProcess) {
                description = nls.localize(22, null);
            }
            return description;
        }
        get icon() {
            switch (this.privacy) {
                case remoteExplorerService_1.TunnelPrivacy.Public: return remoteIcons_1.publicPortIcon;
                default: {
                    if (this.tunnelType !== remoteExplorerService_1.TunnelType.Add) {
                        return remoteIcons_1.privatePortIcon;
                    }
                    else {
                        return undefined;
                    }
                }
            }
        }
        get tooltipPostfix() {
            let information;
            if (this.localAddress) {
                information = nls.localize(23, null, this.remoteHost, this.remotePort, this.localAddress);
            }
            else {
                information = nls.localize(24, null, this.remoteHost, this.remotePort);
            }
            return information;
        }
        get iconTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.processDescription ? nls.localize(25, null) :
                    nls.localize(26, null)}`;
            }
            else {
                return this.label;
            }
        }
        get portTooltip() {
            const isAdd = this.tunnelType === remoteExplorerService_1.TunnelType.Add;
            if (!isAdd) {
                return `${this.name ? nls.localize(27, null, this.name) : ''}`;
            }
            else {
                return '';
            }
        }
        get processTooltip() {
            var _a;
            return (_a = this.processDescription) !== null && _a !== void 0 ? _a : '';
        }
        get originTooltip() {
            return this.source;
        }
        get privacyTooltip() {
            return `${this.privacy === remoteExplorerService_1.TunnelPrivacy.Public ? nls.localize(28, null) :
                nls.localize(29, null)}`;
        }
    }
    exports.TunnelTypeContextKey = new contextkey_1.RawContextKey('tunnelType', remoteExplorerService_1.TunnelType.Add, true);
    exports.TunnelCloseableContextKey = new contextkey_1.RawContextKey('tunnelCloseable', false, true);
    const TunnelPrivacyContextKey = new contextkey_1.RawContextKey('tunnelPrivacy', undefined, true);
    const TunnelViewFocusContextKey = new contextkey_1.RawContextKey('tunnelViewFocus', false, nls.localize(30, null));
    const TunnelViewSelectionKeyName = 'tunnelViewSelection';
    const TunnelViewSelectionContextKey = new contextkey_1.RawContextKey(TunnelViewSelectionKeyName, undefined, true);
    const PortChangableContextKey = new contextkey_1.RawContextKey('portChangable', false, true);
    const WebContextKey = new contextkey_1.RawContextKey('isWeb', platform_1.isWeb, true);
    let TunnelPanel = class TunnelPanel extends viewPane_1.ViewPane {
        constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, menuService, themeService, remoteExplorerService, telemetryService, tunnelService, contextViewService, hoverService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.viewModel = viewModel;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.menuService = menuService;
            this.remoteExplorerService = remoteExplorerService;
            this.tunnelService = tunnelService;
            this.contextViewService = contextViewService;
            this.hoverService = hoverService;
            this.isEditing = false;
            this.titleActions = [];
            this.lastFocus = [];
            this.titleActionsDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.tunnelTypeContext = exports.TunnelTypeContextKey.bindTo(contextKeyService);
            this.tunnelCloseableContext = exports.TunnelCloseableContextKey.bindTo(contextKeyService);
            this.tunnelPrivacyContext = TunnelPrivacyContextKey.bindTo(contextKeyService);
            this.tunnelViewFocusContext = TunnelViewFocusContextKey.bindTo(contextKeyService);
            this.tunnelViewSelectionContext = TunnelViewSelectionContextKey.bindTo(contextKeyService);
            this.portChangableContextKey = PortChangableContextKey.bindTo(contextKeyService);
            const overlayContextKeyService = this._register(this.contextKeyService.createOverlay([['view', TunnelPanel.ID]]));
            const titleMenu = this._register(this.menuService.createMenu(actions_2.MenuId.TunnelTitle, overlayContextKeyService));
            const updateActions = () => {
                this.titleActions = [];
                this.titleActionsDisposable.value = (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(titleMenu, undefined, this.titleActions);
                this.updateActions();
            };
            this._register(titleMenu.onDidChange(updateActions));
            updateActions();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.titleActions = [];
            }));
        }
        get portCount() {
            return this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
        }
        renderBody(container) {
            super.renderBody(container);
            const panelContainer = dom.append(container, dom.$('.tree-explorer-viewlet-tree-view'));
            const widgetContainer = dom.append(panelContainer, dom.$('.customview-tree'));
            widgetContainer.classList.add('ports-view');
            widgetContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
            const actionBarRenderer = new ActionBarRenderer(this.instantiationService, this.contextKeyService, this.menuService, this.contextViewService, this.themeService, this.remoteExplorerService, this.commandService, this.configurationService, this.hoverService);
            const columns = [new IconColumn(), new PortColumn(), new LocalAddressColumn(), new RunningProcessColumn()];
            if (this.tunnelService.canMakePublic) {
                columns.push(new PrivacyColumn());
            }
            columns.push(new OriginColumn());
            this.table = this.instantiationService.createInstance(listService_1.WorkbenchTable, 'RemoteTunnels', widgetContainer, new TunnelTreeVirtualDelegate(this.remoteExplorerService), columns, [actionBarRenderer], {
                keyboardNavigationLabelProvider: {
                    getKeyboardNavigationLabel: (item) => {
                        return item.label;
                    }
                },
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getAriaLabel: (item) => {
                        if (item instanceof TunnelItem) {
                            return `${item.tooltipPostfix} ${item.portTooltip} ${item.iconTooltip} ${item.processTooltip} ${item.originTooltip} ${this.tunnelService.canMakePublic ? item.privacyTooltip : ''}`;
                        }
                        else {
                            return item.label;
                        }
                    },
                    getWidgetAriaLabel: () => nls.localize(32, null)
                },
                openOnSingleClick: true
            });
            const actionRunner = new actions_1.ActionRunner();
            actionBarRenderer.actionRunner = actionRunner;
            this._register(this.table.onContextMenu(e => this.onContextMenu(e, actionRunner)));
            this._register(this.table.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.table.onDidChangeFocus(e => this.onFocusChanged(e)));
            this._register(this.table.onDidFocus(() => this.tunnelViewFocusContext.set(true)));
            this._register(this.table.onDidBlur(() => this.tunnelViewFocusContext.set(false)));
            const rerender = () => this.table.splice(0, Number.POSITIVE_INFINITY, this.viewModel.all);
            rerender();
            let lastPortCount = this.portCount;
            this._register(event_1.Event.debounce(this.viewModel.onForwardedPortsChanged, (_last, e) => e, 50)(() => {
                const newPortCount = this.portCount;
                if (((lastPortCount === 0) || (newPortCount === 0)) && (lastPortCount !== newPortCount)) {
                    this._onDidChangeViewWelcomeState.fire();
                }
                lastPortCount = newPortCount;
                rerender();
            }));
            this._register(this.table.onDidOpen(e => {
                var _a;
                if (!e.element || (e.element.tunnelType !== remoteExplorerService_1.TunnelType.Forwarded)) {
                    return;
                }
                if (((_a = e.browserEvent) === null || _a === void 0 ? void 0 : _a.type) === 'dblclick') {
                    this.commandService.executeCommand(LabelTunnelAction.ID);
                }
                else if (e.browserEvent instanceof MouseEvent) {
                    const editorConf = this.configurationService.getValue('editor');
                    let modifierKey = false;
                    if (editorConf.multiCursorModifier === 'ctrlCmd') {
                        modifierKey = e.browserEvent.altKey;
                    }
                    else {
                        if (platform_1.isMacintosh) {
                            modifierKey = e.browserEvent.metaKey;
                        }
                        else {
                            modifierKey = e.browserEvent.ctrlKey;
                        }
                    }
                    if (modifierKey) {
                        this.commandService.executeCommand(OpenPortInBrowserAction.ID, e.element);
                    }
                }
            }));
            this._register(this.remoteExplorerService.onDidChangeEditable(e => {
                this.isEditing = !!this.remoteExplorerService.getEditableData(e === null || e === void 0 ? void 0 : e.tunnel, e === null || e === void 0 ? void 0 : e.editId);
                this._onDidChangeViewWelcomeState.fire();
                if (!this.isEditing) {
                    widgetContainer.classList.remove('highlight');
                }
                rerender();
                if (this.isEditing) {
                    widgetContainer.classList.add('highlight');
                    if (!e) {
                        // When we are in editing mode for a new forward, rather than updating an existing one we need to reveal the input box since it might be out of view.
                        this.table.reveal(this.table.indexOf(this.viewModel.input));
                    }
                }
                else {
                    if (e && (e.tunnel.tunnelType !== remoteExplorerService_1.TunnelType.Add)) {
                        this.table.setFocus(this.lastFocus);
                    }
                    this.focus();
                }
            }));
        }
        shouldShowWelcome() {
            return this.viewModel.isEmpty() && !this.isEditing;
        }
        focus() {
            super.focus();
            this.table.domFocus();
        }
        onFocusChanged(event) {
            if (event.indexes.length > 0 && event.elements.length > 0) {
                this.lastFocus = event.indexes;
            }
            const elements = event.elements;
            const item = elements && elements.length ? elements[0] : undefined;
            if (item) {
                this.tunnelViewSelectionContext.set(item);
                this.tunnelTypeContext.set(item.tunnelType);
                this.tunnelCloseableContext.set(!!item.closeable);
                this.tunnelPrivacyContext.set(item.privacy);
                this.portChangableContextKey.set(!!item.localPort);
            }
            else {
                this.tunnelTypeContext.reset();
                this.tunnelViewSelectionContext.reset();
                this.tunnelCloseableContext.reset();
                this.tunnelPrivacyContext.reset();
                this.portChangableContextKey.reset();
            }
        }
        onContextMenu(event, actionRunner) {
            if ((event.element !== undefined) && !(event.element instanceof TunnelItem)) {
                return;
            }
            event.browserEvent.preventDefault();
            event.browserEvent.stopPropagation();
            const node = event.element;
            if (node) {
                this.table.setFocus([this.table.indexOf(node)]);
                this.tunnelTypeContext.set(node.tunnelType);
                this.tunnelCloseableContext.set(!!node.closeable);
                this.tunnelPrivacyContext.set(node.privacy);
                this.portChangableContextKey.set(!!node.localPort);
            }
            else {
                this.tunnelTypeContext.set(remoteExplorerService_1.TunnelType.Add);
                this.tunnelCloseableContext.set(false);
                this.tunnelPrivacyContext.set(undefined);
                this.portChangableContextKey.set(false);
            }
            const menu = this.menuService.createMenu(actions_2.MenuId.TunnelContext, this.table.contextKeyService);
            const actions = [];
            this._register((0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, actions));
            menu.dispose();
            this.contextMenuService.showContextMenu({
                getAnchor: () => event.anchor,
                getActions: () => actions,
                getActionViewItem: (action) => {
                    const keybinding = this.keybindingService.lookupKeybinding(action.id);
                    if (keybinding) {
                        return new actionViewItems_1.ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                    }
                    return undefined;
                },
                onHide: (wasCancelled) => {
                    if (wasCancelled) {
                        this.table.domFocus();
                    }
                },
                getActionsContext: () => node,
                actionRunner
            });
        }
        onMouseDblClick(e) {
            if (!e.element) {
                this.commandService.executeCommand(ForwardPortAction.INLINE_ID);
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.table.layout(height, width);
        }
    };
    TunnelPanel.ID = remoteExplorerService_1.TUNNEL_VIEW_ID;
    TunnelPanel.TITLE = nls.localize(31, null);
    TunnelPanel = __decorate([
        __param(2, keybinding_1.IKeybindingService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, opener_1.IOpenerService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, commands_1.ICommandService),
        __param(11, actions_2.IMenuService),
        __param(12, themeService_1.IThemeService),
        __param(13, remoteExplorerService_1.IRemoteExplorerService),
        __param(14, telemetry_1.ITelemetryService),
        __param(15, tunnel_1.ITunnelService),
        __param(16, contextView_1.IContextViewService),
        __param(17, hover_1.IHoverService)
    ], TunnelPanel);
    exports.TunnelPanel = TunnelPanel;
    class TunnelPanelDescriptor {
        constructor(viewModel, environmentService) {
            this.id = TunnelPanel.ID;
            this.name = TunnelPanel.TITLE;
            this.canToggleVisibility = true;
            this.hideByDefault = false;
            this.workspace = true;
            // group is not actually used for views that are not extension contributed. Use order instead.
            this.group = 'details@0';
            // -500 comes from the remote explorer viewOrderDelegate
            this.order = -500;
            this.canMoveView = true;
            this.containerIcon = remoteIcons_1.portsViewIcon;
            this.ctorDescriptor = new descriptors_1.SyncDescriptor(TunnelPanel, [viewModel]);
            this.remoteAuthority = environmentService.remoteAuthority ? environmentService.remoteAuthority.split('+')[0] : undefined;
        }
    }
    exports.TunnelPanelDescriptor = TunnelPanelDescriptor;
    var LabelTunnelAction;
    (function (LabelTunnelAction) {
        LabelTunnelAction.ID = 'remote.tunnel.label';
        LabelTunnelAction.LABEL = nls.localize(33, null);
        LabelTunnelAction.COMMAND_ID_KEYWORD = 'label';
        function isITunnelItem(item) {
            return item && item.tunnelType && item.remoteHost && item.source;
        }
        function handler() {
            return async (accessor, arg) => {
                const context = isITunnelItem(arg) ? arg : accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                if (context) {
                    return new Promise(resolve => {
                        const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                        const startingValue = context.name ? context.name : `${context.remotePort}`;
                        remoteExplorerService.setEditable(context, remoteExplorerService_1.TunnelEditId.Label, {
                            onFinish: async (value, success) => {
                                value = value.trim();
                                remoteExplorerService.setEditable(context, remoteExplorerService_1.TunnelEditId.Label, null);
                                const changed = success && (value !== startingValue);
                                if (changed) {
                                    await remoteExplorerService.tunnelModel.name(context.remoteHost, context.remotePort, value);
                                }
                                resolve(changed ? { port: context.remotePort, label: value } : undefined);
                            },
                            validationMessage: () => null,
                            placeholder: nls.localize(34, null),
                            startingValue
                        });
                    });
                }
                return undefined;
            };
        }
        LabelTunnelAction.handler = handler;
    })(LabelTunnelAction || (LabelTunnelAction = {}));
    const invalidPortString = nls.localize(35, null);
    const maxPortNumber = 65536;
    const invalidPortNumberString = nls.localize(36, null, maxPortNumber);
    const requiresSudoString = nls.localize(37, null);
    const alreadyForwarded = nls.localize(38, null);
    var ForwardPortAction;
    (function (ForwardPortAction) {
        ForwardPortAction.INLINE_ID = 'remote.tunnel.forwardInline';
        ForwardPortAction.COMMANDPALETTE_ID = 'remote.tunnel.forwardCommandPalette';
        ForwardPortAction.LABEL = { value: nls.localize(39, null), original: 'Forward a Port' };
        ForwardPortAction.TREEITEM_LABEL = nls.localize(40, null);
        const forwardPrompt = nls.localize(41, null);
        function validateInput(remoteExplorerService, value, canElevate) {
            const parsed = (0, remoteExplorerService_1.parseAddress)(value);
            if (!parsed) {
                return { content: invalidPortString, severity: notification_1.Severity.Error };
            }
            else if (parsed.port >= maxPortNumber) {
                return { content: invalidPortNumberString, severity: notification_1.Severity.Error };
            }
            else if (canElevate && (0, tunnel_1.isPortPrivileged)(parsed.port)) {
                return { content: requiresSudoString, severity: notification_1.Severity.Info };
            }
            else if ((0, remoteExplorerService_1.mapHasAddressLocalhostOrAllInterfaces)(remoteExplorerService.tunnelModel.forwarded, parsed.host, parsed.port)) {
                return { content: alreadyForwarded, severity: notification_1.Severity.Error };
            }
            return null;
        }
        function error(notificationService, tunnel, host, port) {
            if (!tunnel) {
                notificationService.warn(nls.localize(42, null, host, port));
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, {
                    onFinish: async (value, success) => {
                        remoteExplorerService.setEditable(undefined, remoteExplorerService_1.TunnelEditId.New, null);
                        let parsed;
                        if (success && (parsed = (0, remoteExplorerService_1.parseAddress)(value))) {
                            remoteExplorerService.forward({ host: parsed.host, port: parsed.port }, undefined, undefined, undefined, true).then(tunnel => error(notificationService, tunnel, parsed.host, parsed.port));
                        }
                    },
                    validationMessage: (value) => validateInput(remoteExplorerService, value, tunnelService.canElevate),
                    placeholder: forwardPrompt
                });
            };
        }
        ForwardPortAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const viewsService = accessor.get(views_1.IViewsService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                await viewsService.openView(TunnelPanel.ID, true);
                const value = await quickInputService.input({
                    prompt: forwardPrompt,
                    validateInput: (value) => Promise.resolve(validateInput(remoteExplorerService, value, tunnelService.canElevate))
                });
                let parsed;
                if (value && (parsed = (0, remoteExplorerService_1.parseAddress)(value))) {
                    remoteExplorerService.forward({ host: parsed.host, port: parsed.port }, undefined, undefined, undefined, true).then(tunnel => error(notificationService, tunnel, parsed.host, parsed.port));
                }
            };
        }
        ForwardPortAction.commandPaletteHandler = commandPaletteHandler;
    })(ForwardPortAction = exports.ForwardPortAction || (exports.ForwardPortAction = {}));
    function makeTunnelPicks(tunnels, remoteExplorerService) {
        const picks = tunnels.map(forwarded => {
            const item = TunnelItem.createFromTunnel(remoteExplorerService, forwarded);
            return {
                label: item.label,
                description: item.processDescription,
                tunnel: item
            };
        });
        if (picks.length === 0) {
            picks.push({
                label: nls.localize(43, null, ForwardPortAction.LABEL.value)
            });
        }
        return picks;
    }
    var ClosePortAction;
    (function (ClosePortAction) {
        ClosePortAction.INLINE_ID = 'remote.tunnel.closeInline';
        ClosePortAction.COMMANDPALETTE_ID = 'remote.tunnel.closeCommandPalette';
        ClosePortAction.LABEL = { value: nls.localize(44, null), original: 'Stop Forwarding Port' };
        function inlineHandler() {
            return async (accessor, arg) => {
                const context = (arg !== undefined || arg instanceof TunnelItem) ? arg : accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                if (context instanceof TunnelItem) {
                    const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                    await remoteExplorerService.close({ host: context.remoteHost, port: context.remotePort });
                }
            };
        }
        ClosePortAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const commandService = accessor.get(commands_1.ICommandService);
                const picks = makeTunnelPicks(Array.from(remoteExplorerService.tunnelModel.forwarded.values()).filter(tunnel => tunnel.closeable), remoteExplorerService);
                const result = await quickInputService.pick(picks, { placeHolder: nls.localize(45, null) });
                if (result && result.tunnel) {
                    await remoteExplorerService.close({ host: result.tunnel.remoteHost, port: result.tunnel.remotePort });
                }
                else if (result) {
                    await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
                }
            };
        }
        ClosePortAction.commandPaletteHandler = commandPaletteHandler;
    })(ClosePortAction || (ClosePortAction = {}));
    var OpenPortInBrowserAction;
    (function (OpenPortInBrowserAction) {
        OpenPortInBrowserAction.ID = 'remote.tunnel.open';
        OpenPortInBrowserAction.LABEL = nls.localize(46, null);
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (arg instanceof TunnelItem) {
                    key = (0, remoteExplorerService_1.makeAddress)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, remoteExplorerService_1.makeAddress)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.IRemoteExplorerService).tunnelModel;
                    const openerService = accessor.get(opener_1.IOpenerService);
                    return run(model, openerService, key);
                }
            };
        }
        OpenPortInBrowserAction.handler = handler;
        function run(model, openerService, key) {
            const tunnel = model.forwarded.get(key) || model.detected.get(key);
            let address;
            if (tunnel && tunnel.localAddress && (address = model.address(tunnel.remoteHost, tunnel.remotePort))) {
                if (!address.startsWith('http')) {
                    address = `http://${address}`;
                }
                return openerService.open(uri_1.URI.parse(address), { allowContributedOpeners: false });
            }
            return Promise.resolve();
        }
        OpenPortInBrowserAction.run = run;
    })(OpenPortInBrowserAction = exports.OpenPortInBrowserAction || (exports.OpenPortInBrowserAction = {}));
    var OpenPortInPreviewAction;
    (function (OpenPortInPreviewAction) {
        OpenPortInPreviewAction.ID = 'remote.tunnel.openPreview';
        OpenPortInPreviewAction.LABEL = nls.localize(47, null);
        function handler() {
            return async (accessor, arg) => {
                let key;
                if (arg instanceof TunnelItem) {
                    key = (0, remoteExplorerService_1.makeAddress)(arg.remoteHost, arg.remotePort);
                }
                else if (arg.tunnelRemoteHost && arg.tunnelRemotePort) {
                    key = (0, remoteExplorerService_1.makeAddress)(arg.tunnelRemoteHost, arg.tunnelRemotePort);
                }
                if (key) {
                    const model = accessor.get(remoteExplorerService_1.IRemoteExplorerService).tunnelModel;
                    const openerService = accessor.get(opener_1.IOpenerService);
                    const externalOpenerService = accessor.get(externalUriOpenerService_1.IExternalUriOpenerService);
                    return run(model, openerService, externalOpenerService, key);
                }
            };
        }
        OpenPortInPreviewAction.handler = handler;
        async function run(model, openerService, externalOpenerService, key) {
            const tunnel = model.forwarded.get(key) || model.detected.get(key);
            let address;
            if (tunnel && tunnel.localAddress && (address = model.address(tunnel.remoteHost, tunnel.remotePort))) {
                if (!address.startsWith('http')) {
                    address = `http://${address}`;
                }
                const uri = uri_1.URI.parse(address);
                const sourceUri = uri_1.URI.parse(`http://${tunnel.remoteHost}:${tunnel.remotePort}`);
                const opener = await externalOpenerService.getOpener(uri, { sourceUri }, new cancellation_1.CancellationTokenSource().token);
                if (opener) {
                    return opener.openExternalUri(uri, { sourceUri }, new cancellation_1.CancellationTokenSource().token);
                }
                return openerService.open(uri);
            }
            return Promise.resolve();
        }
        OpenPortInPreviewAction.run = run;
    })(OpenPortInPreviewAction = exports.OpenPortInPreviewAction || (exports.OpenPortInPreviewAction = {}));
    var OpenPortInBrowserCommandPaletteAction;
    (function (OpenPortInBrowserCommandPaletteAction) {
        OpenPortInBrowserCommandPaletteAction.ID = 'remote.tunnel.openCommandPalette';
        OpenPortInBrowserCommandPaletteAction.LABEL = nls.localize(48, null);
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const model = remoteExplorerService.tunnelModel;
                const quickPickService = accessor.get(quickInput_1.IQuickInputService);
                const openerService = accessor.get(opener_1.IOpenerService);
                const commandService = accessor.get(commands_1.ICommandService);
                const options = [...model.forwarded, ...model.detected].map(value => {
                    const tunnelItem = TunnelItem.createFromTunnel(remoteExplorerService, value[1]);
                    return {
                        label: tunnelItem.label,
                        description: tunnelItem.processDescription,
                        tunnel: tunnelItem
                    };
                });
                if (options.length === 0) {
                    options.push({
                        label: nls.localize(49, null)
                    });
                }
                else {
                    options.push({
                        label: nls.localize(50, null)
                    });
                }
                const picked = await quickPickService.pick(options, { placeHolder: nls.localize(51, null) });
                if (picked && picked.tunnel) {
                    return OpenPortInBrowserAction.run(model, openerService, (0, remoteExplorerService_1.makeAddress)(picked.tunnel.remoteHost, picked.tunnel.remotePort));
                }
                else if (picked) {
                    return commandService.executeCommand(`${remoteExplorerService_1.TUNNEL_VIEW_ID}.focus`);
                }
            };
        }
        OpenPortInBrowserCommandPaletteAction.handler = handler;
    })(OpenPortInBrowserCommandPaletteAction || (OpenPortInBrowserCommandPaletteAction = {}));
    var CopyAddressAction;
    (function (CopyAddressAction) {
        CopyAddressAction.INLINE_ID = 'remote.tunnel.copyAddressInline';
        CopyAddressAction.COMMANDPALETTE_ID = 'remote.tunnel.copyAddressCommandPalette';
        CopyAddressAction.INLINE_LABEL = nls.localize(52, null);
        CopyAddressAction.COMMANDPALETTE_LABEL = nls.localize(53, null);
        async function copyAddress(remoteExplorerService, clipboardService, tunnelItem) {
            const address = remoteExplorerService.tunnelModel.address(tunnelItem.remoteHost, tunnelItem.remotePort);
            if (address) {
                await clipboardService.writeText(address.toString());
            }
        }
        function inlineHandler() {
            return async (accessor, arg) => {
                const context = (arg !== undefined || arg instanceof TunnelItem) ? arg : accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                if (context instanceof TunnelItem) {
                    return copyAddress(accessor.get(remoteExplorerService_1.IRemoteExplorerService), accessor.get(clipboardService_1.IClipboardService), context);
                }
            };
        }
        CopyAddressAction.inlineHandler = inlineHandler;
        function commandPaletteHandler() {
            return async (accessor, arg) => {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const commandService = accessor.get(commands_1.ICommandService);
                const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                const tunnels = Array.from(remoteExplorerService.tunnelModel.forwarded.values()).concat(Array.from(remoteExplorerService.tunnelModel.detected.values()));
                const result = await quickInputService.pick(makeTunnelPicks(tunnels, remoteExplorerService), { placeHolder: nls.localize(54, null) });
                if (result && result.tunnel) {
                    await copyAddress(remoteExplorerService, clipboardService, result.tunnel);
                }
                else if (result) {
                    await commandService.executeCommand(ForwardPortAction.COMMANDPALETTE_ID);
                }
            };
        }
        CopyAddressAction.commandPaletteHandler = commandPaletteHandler;
    })(CopyAddressAction || (CopyAddressAction = {}));
    var ChangeLocalPortAction;
    (function (ChangeLocalPortAction) {
        ChangeLocalPortAction.ID = 'remote.tunnel.changeLocalPort';
        ChangeLocalPortAction.LABEL = nls.localize(55, null);
        function validateInput(value, canElevate) {
            if (!value.match(/^[0-9]+$/)) {
                return { content: invalidPortString, severity: notification_1.Severity.Error };
            }
            else if (Number(value) >= maxPortNumber) {
                return { content: invalidPortNumberString, severity: notification_1.Severity.Error };
            }
            else if (canElevate && (0, tunnel_1.isPortPrivileged)(Number(value))) {
                return { content: requiresSudoString, severity: notification_1.Severity.Info };
            }
            return null;
        }
        function handler() {
            return async (accessor, arg) => {
                const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const tunnelService = accessor.get(tunnel_1.ITunnelService);
                const context = (arg !== undefined || arg instanceof TunnelItem) ? arg : accessor.get(contextkey_1.IContextKeyService).getContextKeyValue(TunnelViewSelectionKeyName);
                if (context instanceof TunnelItem) {
                    remoteExplorerService.setEditable(context, remoteExplorerService_1.TunnelEditId.LocalPort, {
                        onFinish: async (value, success) => {
                            var _a;
                            remoteExplorerService.setEditable(context, remoteExplorerService_1.TunnelEditId.LocalPort, null);
                            if (success) {
                                await remoteExplorerService.close({ host: context.remoteHost, port: context.remotePort });
                                const numberValue = Number(value);
                                const newForward = await remoteExplorerService.forward({ host: context.remoteHost, port: context.remotePort }, numberValue, context.name, undefined, true);
                                if (newForward && newForward.tunnelLocalPort !== numberValue) {
                                    notificationService.warn(nls.localize(56, null, value, (_a = newForward.tunnelLocalPort) !== null && _a !== void 0 ? _a : newForward.localAddress));
                                }
                            }
                        },
                        validationMessage: (value) => validateInput(value, tunnelService.canElevate),
                        placeholder: nls.localize(57, null)
                    });
                }
            };
        }
        ChangeLocalPortAction.handler = handler;
    })(ChangeLocalPortAction || (ChangeLocalPortAction = {}));
    var MakePortPublicAction;
    (function (MakePortPublicAction) {
        MakePortPublicAction.ID = 'remote.tunnel.makePublic';
        MakePortPublicAction.LABEL = nls.localize(58, null);
        function handler() {
            return async (accessor, arg) => {
                if (arg instanceof TunnelItem) {
                    const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                    await remoteExplorerService.close({ host: arg.remoteHost, port: arg.remotePort });
                    return remoteExplorerService.forward({ host: arg.remoteHost, port: arg.remotePort }, arg.localPort, arg.name, undefined, true, true);
                }
            };
        }
        MakePortPublicAction.handler = handler;
    })(MakePortPublicAction || (MakePortPublicAction = {}));
    var MakePortPrivateAction;
    (function (MakePortPrivateAction) {
        MakePortPrivateAction.ID = 'remote.tunnel.makePrivate';
        MakePortPrivateAction.LABEL = nls.localize(59, null);
        function handler() {
            return async (accessor, arg) => {
                if (arg instanceof TunnelItem) {
                    const remoteExplorerService = accessor.get(remoteExplorerService_1.IRemoteExplorerService);
                    await remoteExplorerService.close({ host: arg.remoteHost, port: arg.remotePort });
                    return remoteExplorerService.forward({ host: arg.remoteHost, port: arg.remotePort }, arg.localPort, arg.name, undefined, true, false);
                }
            };
        }
        MakePortPrivateAction.handler = handler;
    })(MakePortPrivateAction || (MakePortPrivateAction = {}));
    const tunnelViewCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: LabelTunnelAction.ID,
        weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(TunnelViewFocusContextKey, exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded)),
        primary: 60 /* F2 */,
        mac: {
            primary: 3 /* Enter */
        },
        handler: LabelTunnelAction.handler()
    });
    commands_1.CommandsRegistry.registerCommand(ForwardPortAction.INLINE_ID, ForwardPortAction.inlineHandler());
    commands_1.CommandsRegistry.registerCommand(ForwardPortAction.COMMANDPALETTE_ID, ForwardPortAction.commandPaletteHandler());
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: ClosePortAction.INLINE_ID,
        weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(exports.TunnelCloseableContextKey, TunnelViewFocusContextKey),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
            secondary: [20 /* Delete */]
        },
        handler: ClosePortAction.inlineHandler()
    });
    commands_1.CommandsRegistry.registerCommand(ClosePortAction.COMMANDPALETTE_ID, ClosePortAction.commandPaletteHandler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInBrowserAction.ID, OpenPortInBrowserAction.handler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInPreviewAction.ID, OpenPortInPreviewAction.handler());
    commands_1.CommandsRegistry.registerCommand(OpenPortInBrowserCommandPaletteAction.ID, OpenPortInBrowserCommandPaletteAction.handler());
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CopyAddressAction.INLINE_ID,
        weight: 200 /* WorkbenchContrib */ + tunnelViewCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(TunnelViewFocusContextKey, exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded)), contextkey_1.ContextKeyExpr.and(TunnelViewFocusContextKey, exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected))),
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        handler: CopyAddressAction.inlineHandler()
    });
    commands_1.CommandsRegistry.registerCommand(CopyAddressAction.COMMANDPALETTE_ID, CopyAddressAction.commandPaletteHandler());
    commands_1.CommandsRegistry.registerCommand(ChangeLocalPortAction.ID, ChangeLocalPortAction.handler());
    commands_1.CommandsRegistry.registerCommand(MakePortPublicAction.ID, MakePortPublicAction.handler());
    commands_1.CommandsRegistry.registerCommand(MakePortPrivateAction.ID, MakePortPrivateAction.handler());
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: ClosePortAction.COMMANDPALETTE_ID,
            title: ClosePortAction.LABEL
        },
        when: exports.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: ForwardPortAction.COMMANDPALETTE_ID,
            title: ForwardPortAction.LABEL
        },
        when: exports.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: CopyAddressAction.COMMANDPALETTE_ID,
            title: CopyAddressAction.COMMANDPALETTE_LABEL
        },
        when: exports.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, ({
        command: {
            id: OpenPortInBrowserCommandPaletteAction.ID,
            title: OpenPortInBrowserCommandPaletteAction.LABEL
        },
        when: exports.forwardedPortsViewEnabled
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '._open',
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected))
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '._open',
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(WebContextKey.negate(), TunnelPrivacyContextKey.isEqualTo(remoteExplorerService_1.TunnelPrivacy.Public)), contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected)))
    }));
    // The group 0_manage is used by extensions, so try not to change it
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '0_manage',
        order: 1,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.labelPortIcon
        },
        when: exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 0,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
        },
        when: contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected))
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 1,
        command: {
            id: ChangeLocalPortAction.ID,
            title: ChangeLocalPortAction.LABEL,
        },
        when: contextkey_1.ContextKeyExpr.and(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), PortChangableContextKey)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 2,
        command: {
            id: MakePortPublicAction.ID,
            title: MakePortPublicAction.LABEL,
        },
        when: TunnelPrivacyContextKey.isEqualTo(remoteExplorerService_1.TunnelPrivacy.Private)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '2_localaddress',
        order: 2,
        command: {
            id: MakePortPrivateAction.ID,
            title: MakePortPrivateAction.LABEL,
        },
        when: TunnelPrivacyContextKey.isEqualTo(remoteExplorerService_1.TunnelPrivacy.Public)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '3_forward',
        order: 0,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
        },
        when: exports.TunnelCloseableContextKey
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelContext, ({
        group: '3_forward',
        order: 1,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.LABEL,
        },
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 0,
        command: {
            id: ForwardPortAction.INLINE_ID,
            title: ForwardPortAction.TREEITEM_LABEL,
            icon: remoteIcons_1.forwardPortIcon
        },
        when: exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Candidate)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 4,
        command: {
            id: LabelTunnelAction.ID,
            title: LabelTunnelAction.LABEL,
            icon: remoteIcons_1.labelPortIcon
        },
        when: exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded)
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelPortInline, ({
        group: '0_manage',
        order: 5,
        command: {
            id: ClosePortAction.INLINE_ID,
            title: ClosePortAction.LABEL,
            icon: remoteIcons_1.stopForwardIcon
        },
        when: exports.TunnelCloseableContextKey
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: -1,
        command: {
            id: CopyAddressAction.INLINE_ID,
            title: CopyAddressAction.INLINE_LABEL,
            icon: remoteIcons_1.copyAddressIcon
        },
        when: contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected))
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: 0,
        command: {
            id: OpenPortInBrowserAction.ID,
            title: OpenPortInBrowserAction.LABEL,
            icon: remoteIcons_1.openBrowserIcon
        },
        when: contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected))
    }));
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TunnelLocalAddressInline, ({
        order: 1,
        command: {
            id: OpenPortInPreviewAction.ID,
            title: OpenPortInPreviewAction.LABEL,
            icon: remoteIcons_1.openPreviewIcon
        },
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(WebContextKey.negate(), TunnelPrivacyContextKey.isEqualTo(remoteExplorerService_1.TunnelPrivacy.Public)), contextkey_1.ContextKeyExpr.or(exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Forwarded), exports.TunnelTypeContextKey.isEqualTo(remoteExplorerService_1.TunnelType.Detected)))
    }));
    exports.portWithRunningProcessForeground = (0, colorRegistry_1.registerColor)('ports.iconRunningProcessForeground', {
        light: theme_1.STATUS_BAR_HOST_NAME_BACKGROUND,
        dark: theme_1.STATUS_BAR_HOST_NAME_BACKGROUND,
        hc: theme_1.STATUS_BAR_HOST_NAME_BACKGROUND
    }, nls.localize(60, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const portWithRunningProcessColor = theme.getColor(exports.portWithRunningProcessForeground);
        if (portWithRunningProcessColor) {
            collector.addRule(`.monaco-workbench ${themeService_1.ThemeIcon.asCSSSelector(remoteIcons_1.forwardedPortWithProcessIcon)} { color: ${portWithRunningProcessColor} ; }`);
        }
    });
});
//# sourceMappingURL=tunnelView.js.map