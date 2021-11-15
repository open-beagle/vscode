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
define(["require", "exports", "vs/base/common/resources", "vs/base/browser/dom", "vs/base/common/actions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/base/common/lifecycle", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/list/browser/listService", "vs/platform/theme/common/styler", "vs/platform/configuration/common/configuration", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/base/browser/touch", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/debug/browser/breakpointsView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/editor/browser/editorBrowser", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/codicons"], function (require, exports, resources, dom, actions_1, debug_1, debugModel_1, contextView_1, instantiation_1, keybinding_1, themeService_1, lifecycle_1, inputBox_1, listService_1, styler_1, configuration_1, editorService_1, viewPane_1, label_1, contextkey_1, touch_1, views_1, opener_1, telemetry_1, icons, actions_2, nls_1, menuEntryActionViewItem_1, editorBrowser_1, actionbar_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBreakpointMessageAndIcon = exports.openBreakpointSource = exports.BreakpointsView = exports.getExpandedBodySize = void 0;
    const $ = dom.$;
    function createCheckbox() {
        const checkbox = $('input');
        checkbox.type = 'checkbox';
        checkbox.tabIndex = -1;
        touch_1.Gesture.ignoreTarget(checkbox);
        return checkbox;
    }
    const MAX_VISIBLE_BREAKPOINTS = 9;
    function getExpandedBodySize(model, countLimit) {
        const length = model.getBreakpoints().length + model.getExceptionBreakpoints().length + model.getFunctionBreakpoints().length + model.getDataBreakpoints().length;
        return Math.min(countLimit, length) * 22;
    }
    exports.getExpandedBodySize = getExpandedBodySize;
    let BreakpointsView = class BreakpointsView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, instantiationService, themeService, editorService, contextViewService, configurationService, viewDescriptorService, contextKeyService, openerService, telemetryService, labelService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.editorService = editorService;
            this.contextViewService = contextViewService;
            this.labelService = labelService;
            this.needsRefresh = false;
            this.ignoreLayout = false;
            this.menu = menuService.createMenu(actions_2.MenuId.DebugBreakpointsContext, contextKeyService);
            this._register(this.menu);
            this.breakpointItemType = debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.bindTo(contextKeyService);
            this.breakpointSupportsCondition = debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION.bindTo(contextKeyService);
            this.breakpointInputFocused = debug_1.CONTEXT_BREAKPOINT_INPUT_FOCUSED.bindTo(contextKeyService);
            this._register(this.debugService.getModel().onDidChangeBreakpoints(() => this.onBreakpointsChange()));
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-breakpoints');
            const delegate = new BreakpointsDelegate(this);
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, 'Breakpoints', container, delegate, [
                this.instantiationService.createInstance(BreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                new ExceptionBreakpointsRenderer(this.menu, this.breakpointSupportsCondition, this.breakpointItemType, this.debugService),
                new ExceptionBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.themeService),
                this.instantiationService.createInstance(FunctionBreakpointsRenderer, this.menu, this.breakpointSupportsCondition, this.breakpointItemType),
                this.instantiationService.createInstance(DataBreakpointsRenderer),
                new FunctionBreakpointInputRenderer(this, this.debugService, this.contextViewService, this.themeService, this.labelService)
            ], {
                identityProvider: { getId: (element) => element.getId() },
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e },
                accessibilityProvider: new BreakpointsAccessibilityProvider(this.debugService, this.labelService),
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            debug_1.CONTEXT_BREAKPOINTS_FOCUSED.bindTo(this.list.contextKeyService);
            this._register(this.list.onContextMenu(this.onListContextMenu, this));
            this.list.onMouseMiddleClick(async ({ element }) => {
                if (element instanceof debugModel_1.Breakpoint) {
                    await this.debugService.removeBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.FunctionBreakpoint) {
                    await this.debugService.removeFunctionBreakpoints(element.getId());
                }
                else if (element instanceof debugModel_1.DataBreakpoint) {
                    await this.debugService.removeDataBreakpoints(element.getId());
                }
            });
            this._register(this.list.onDidOpen(async (e) => {
                var _a;
                if (!e.element) {
                    return;
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.button === 1) { // middle click
                    return;
                }
                if (e.element instanceof debugModel_1.Breakpoint) {
                    openBreakpointSource(e.element, e.sideBySide, e.editorOptions.preserveFocus || false, e.editorOptions.pinned || !e.editorOptions.preserveFocus, this.debugService, this.editorService);
                }
                if (e.browserEvent instanceof MouseEvent && e.browserEvent.detail === 2 && e.element instanceof debugModel_1.FunctionBreakpoint && e.element !== ((_a = this.inputBoxData) === null || _a === void 0 ? void 0 : _a.breakpoint)) {
                    // double click
                    this.renderInputBox({ breakpoint: e.element, type: 'name' });
                }
            }));
            this.list.splice(0, this.list.length, this.elements);
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.onBreakpointsChange();
                }
            }));
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            this._register(containerModel.onDidChangeAllViewDescriptors(() => {
                this.updateSize();
            }));
        }
        focus() {
            super.focus();
            if (this.list) {
                this.list.domFocus();
            }
        }
        renderInputBox(data) {
            this._inputBoxData = data;
            this.onBreakpointsChange();
            this._inputBoxData = undefined;
        }
        get inputBoxData() {
            return this._inputBoxData;
        }
        layoutBody(height, width) {
            if (this.ignoreLayout) {
                return;
            }
            super.layoutBody(height, width);
            if (this.list) {
                this.list.layout(height, width);
            }
            try {
                this.ignoreLayout = true;
                this.updateSize();
            }
            finally {
                this.ignoreLayout = false;
            }
        }
        onListContextMenu(e) {
            const element = e.element;
            const type = element instanceof debugModel_1.Breakpoint ? 'breakpoint' : element instanceof debugModel_1.ExceptionBreakpoint ? 'exceptionBreakpoint' :
                element instanceof debugModel_1.FunctionBreakpoint ? 'functionBreakpoint' : element instanceof debugModel_1.DataBreakpoint ? 'dataBreakpoint' : undefined;
            this.breakpointItemType.set(type);
            const session = this.debugService.getViewModel().focusedSession;
            const conditionSupported = element instanceof debugModel_1.ExceptionBreakpoint ? element.supportsCondition : (!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointSupportsCondition.set(conditionSupported);
            const secondary = [];
            const actionsDisposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: e.element, shouldForwardArgs: false }, { primary: [], secondary }, 'inline');
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => secondary,
                getActionsContext: () => element,
                onHide: () => (0, lifecycle_1.dispose)(actionsDisposable)
            });
        }
        updateSize() {
            const containerModel = this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id));
            // Adjust expanded body size
            this.minimumBodySize = this.orientation === 0 /* VERTICAL */ ? getExpandedBodySize(this.debugService.getModel(), MAX_VISIBLE_BREAKPOINTS) : 170;
            this.maximumBodySize = this.orientation === 0 /* VERTICAL */ && containerModel.visibleViewDescriptors.length > 1 ? getExpandedBodySize(this.debugService.getModel(), Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
        }
        onBreakpointsChange() {
            if (this.isBodyVisible()) {
                this.updateSize();
                if (this.list) {
                    const lastFocusIndex = this.list.getFocus()[0];
                    // Check whether focused element was removed
                    const needsRefocus = lastFocusIndex && !this.elements.includes(this.list.element(lastFocusIndex));
                    this.list.splice(0, this.list.length, this.elements);
                    this.needsRefresh = false;
                    if (needsRefocus) {
                        this.list.focusNth(Math.min(lastFocusIndex, this.list.length - 1));
                    }
                }
            }
            else {
                this.needsRefresh = true;
            }
        }
        get elements() {
            const model = this.debugService.getModel();
            const elements = model.getExceptionBreakpoints().concat(model.getFunctionBreakpoints()).concat(model.getDataBreakpoints()).concat(model.getBreakpoints());
            return elements;
        }
    };
    BreakpointsView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, themeService_1.IThemeService),
        __param(6, editorService_1.IEditorService),
        __param(7, contextView_1.IContextViewService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, views_1.IViewDescriptorService),
        __param(10, contextkey_1.IContextKeyService),
        __param(11, opener_1.IOpenerService),
        __param(12, telemetry_1.ITelemetryService),
        __param(13, label_1.ILabelService),
        __param(14, actions_2.IMenuService)
    ], BreakpointsView);
    exports.BreakpointsView = BreakpointsView;
    class BreakpointsDelegate {
        constructor(view) {
            this.view = view;
            // noop
        }
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            var _a, _b;
            if (element instanceof debugModel_1.Breakpoint) {
                return BreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.FunctionBreakpoint) {
                const inputBoxBreakpoint = (_a = this.view.inputBoxData) === null || _a === void 0 ? void 0 : _a.breakpoint;
                if (!element.name || (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId())) {
                    return FunctionBreakpointInputRenderer.ID;
                }
                return FunctionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                const inputBoxBreakpoint = (_b = this.view.inputBoxData) === null || _b === void 0 ? void 0 : _b.breakpoint;
                if (inputBoxBreakpoint && inputBoxBreakpoint.getId() === element.getId()) {
                    return ExceptionBreakpointInputRenderer.ID;
                }
                return ExceptionBreakpointsRenderer.ID;
            }
            if (element instanceof debugModel_1.DataBreakpoint) {
                return DataBreakpointsRenderer.ID;
            }
            return '';
        }
    }
    const breakpointIdToActionBarDomeNode = new Map();
    let BreakpointsRenderer = class BreakpointsRenderer {
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        get templateId() {
            return BreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox();
            data.toDispose = [];
            data.elementDisposable = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.filePath = dom.append(data.breakpoint, $('span.file-path'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            const lineNumberContainer = dom.append(data.breakpoint, $('.line-number-container'));
            data.lineNumber = dom.append(lineNumberContainer, $('span.line-number.monaco-count-badge'));
            return data;
        }
        renderElement(breakpoint, index, data) {
            data.context = breakpoint;
            data.breakpoint.classList.toggle('disabled', !this.debugService.getModel().areBreakpointsActivated());
            data.name.textContent = resources.basenameOrAuthority(breakpoint.uri);
            data.lineNumber.textContent = breakpoint.lineNumber.toString();
            if (breakpoint.column) {
                data.lineNumber.textContent += `:${breakpoint.column}`;
            }
            data.filePath.textContent = this.labelService.getUriLabel(resources.dirname(breakpoint.uri), { relative: true });
            data.checkbox.checked = breakpoint.enabled;
            const { message, icon } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), breakpoint, this.labelService);
            data.icon.className = themeService_1.ThemeIcon.asClassName(icon);
            data.breakpoint.title = breakpoint.message || message || '';
            const debugActive = this.debugService.state === 3 /* Running */ || this.debugService.state === 2 /* Stopped */;
            if (debugActive && !breakpoint.verified) {
                data.breakpoint.classList.add('disabled');
            }
            const primary = [];
            const session = this.debugService.getViewModel().focusedSession;
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('breakpoint');
            data.elementDisposable.push((0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: breakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline'));
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(breakpoint.getId(), data.actionBar.domNode);
        }
        disposeElement(_element, _index, templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    BreakpointsRenderer.ID = 'breakpoints';
    BreakpointsRenderer = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], BreakpointsRenderer);
    class ExceptionBreakpointsRenderer {
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            // noop
        }
        get templateId() {
            return ExceptionBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.checkbox = createCheckbox();
            data.toDispose = [];
            data.elementDisposable = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.breakpoint.classList.add('exception');
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(exceptionBreakpoint, index, data) {
            data.context = exceptionBreakpoint;
            data.name.textContent = exceptionBreakpoint.label || `${exceptionBreakpoint.filter} exceptions`;
            data.breakpoint.title = exceptionBreakpoint.verified ? (exceptionBreakpoint.description || data.name.textContent) : exceptionBreakpoint.message || (0, nls_1.localize)(0, null);
            data.breakpoint.classList.toggle('disabled', !exceptionBreakpoint.verified);
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.condition.textContent = exceptionBreakpoint.condition || '';
            data.condition.title = (0, nls_1.localize)(1, null, exceptionBreakpoint.condition);
            const primary = [];
            this.breakpointSupportsCondition.set(exceptionBreakpoint.supportsCondition);
            this.breakpointItemType.set('exceptionBreakpoint');
            data.elementDisposable.push((0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: exceptionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline'));
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(exceptionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeElement(_element, _index, templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    ExceptionBreakpointsRenderer.ID = 'exceptionbreakpoints';
    let FunctionBreakpointsRenderer = class FunctionBreakpointsRenderer {
        constructor(menu, breakpointSupportsCondition, breakpointItemType, debugService, labelService) {
            this.menu = menu;
            this.breakpointSupportsCondition = breakpointSupportsCondition;
            this.breakpointItemType = breakpointItemType;
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        get templateId() {
            return FunctionBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox();
            data.toDispose = [];
            data.elementDisposable = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.condition = dom.append(data.breakpoint, $('span.condition'));
            data.actionBar = new actionbar_1.ActionBar(data.breakpoint);
            data.toDispose.push(data.actionBar);
            return data;
        }
        renderElement(functionBreakpoint, _index, data) {
            data.context = functionBreakpoint;
            data.name.textContent = functionBreakpoint.name;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService);
            data.icon.className = themeService_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            if (functionBreakpoint.condition && functionBreakpoint.hitCondition) {
                data.condition.textContent = (0, nls_1.localize)(2, null, functionBreakpoint.condition, functionBreakpoint.hitCondition);
            }
            else {
                data.condition.textContent = functionBreakpoint.condition || functionBreakpoint.hitCondition || '';
            }
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsFunctionBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsFunctionBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)(3, null);
            }
            const primary = [];
            this.breakpointSupportsCondition.set(!session || !!session.capabilities.supportsConditionalBreakpoints);
            this.breakpointItemType.set('functionBreakpoint');
            data.elementDisposable.push((0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(this.menu, { arg: functionBreakpoint, shouldForwardArgs: true }, { primary, secondary: [] }, 'inline'));
            data.actionBar.clear();
            data.actionBar.push(primary, { icon: true, label: false });
            breakpointIdToActionBarDomeNode.set(functionBreakpoint.getId(), data.actionBar.domNode);
        }
        disposeElement(_element, _index, templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    FunctionBreakpointsRenderer.ID = 'functionbreakpoints';
    FunctionBreakpointsRenderer = __decorate([
        __param(3, debug_1.IDebugService),
        __param(4, label_1.ILabelService)
    ], FunctionBreakpointsRenderer);
    let DataBreakpointsRenderer = class DataBreakpointsRenderer {
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
            // noop
        }
        get templateId() {
            return DataBreakpointsRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.breakpoint = dom.append(container, $('.breakpoint'));
            data.icon = $('.icon');
            data.checkbox = createCheckbox();
            data.toDispose = [];
            data.toDispose.push(dom.addStandardDisposableListener(data.checkbox, 'change', (e) => {
                this.debugService.enableOrDisableBreakpoints(!data.context.enabled, data.context);
            }));
            dom.append(data.breakpoint, data.icon);
            dom.append(data.breakpoint, data.checkbox);
            data.name = dom.append(data.breakpoint, $('span.name'));
            data.accessType = dom.append(data.breakpoint, $('span.access-type'));
            return data;
        }
        renderElement(dataBreakpoint, _index, data) {
            data.context = dataBreakpoint;
            data.name.textContent = dataBreakpoint.description;
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), dataBreakpoint, this.labelService);
            data.icon.className = themeService_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = dataBreakpoint.enabled;
            data.breakpoint.title = message ? message : '';
            // Mark function breakpoints as disabled if deactivated or if debug type does not support them #9099
            const session = this.debugService.getViewModel().focusedSession;
            data.breakpoint.classList.toggle('disabled', (session && !session.capabilities.supportsDataBreakpoints) || !this.debugService.getModel().areBreakpointsActivated());
            if (session && !session.capabilities.supportsDataBreakpoints) {
                data.breakpoint.title = (0, nls_1.localize)(4, null);
            }
            if (dataBreakpoint.accessType) {
                const accessType = dataBreakpoint.accessType === 'read' ? (0, nls_1.localize)(5, null) : dataBreakpoint.accessType === 'write' ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null);
                data.accessType.textContent = accessType;
            }
            else {
                data.accessType.textContent = '';
            }
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    };
    DataBreakpointsRenderer.ID = 'databreakpoints';
    DataBreakpointsRenderer = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, label_1.ILabelService)
    ], DataBreakpointsRenderer);
    class FunctionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService, themeService, labelService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.labelService = labelService;
        }
        get templateId() {
            return FunctionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const breakpoint = dom.append(container, $('.breakpoint'));
            template.icon = $('.icon');
            template.checkbox = createCheckbox();
            dom.append(breakpoint, template.icon);
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService);
            const styler = (0, styler_1.attachInputBoxStyler)(inputBox, this.themeService);
            const toDispose = [inputBox, styler];
            const wrapUp = (success) => {
                this.view.breakpointInputFocused.set(false);
                const id = template.breakpoint.getId();
                if (success) {
                    if (template.type === 'name') {
                        this.debugService.updateFunctionBreakpoint(id, { name: inputBox.value });
                    }
                    if (template.type === 'condition') {
                        this.debugService.updateFunctionBreakpoint(id, { condition: inputBox.value });
                    }
                    if (template.type === 'hitCount') {
                        this.debugService.updateFunctionBreakpoint(id, { hitCondition: inputBox.value });
                    }
                }
                else {
                    if (template.type === 'name' && !template.breakpoint.name) {
                        this.debugService.removeFunctionBreakpoints(id);
                    }
                    else {
                        this.view.renderInputBox(undefined);
                    }
                }
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* Escape */);
                const isEnter = e.equals(3 /* Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                // Need to react with a timeout on the blur event due to possible concurent splices #56443
                setTimeout(() => {
                    wrapUp(!!inputBox.value);
                });
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(functionBreakpoint, _index, data) {
            var _a;
            data.breakpoint = functionBreakpoint;
            data.type = ((_a = this.view.inputBoxData) === null || _a === void 0 ? void 0 : _a.type) || 'name'; // If there is no type set take the 'name' as the default
            const { icon, message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), functionBreakpoint, this.labelService);
            data.icon.className = themeService_1.ThemeIcon.asClassName(icon);
            data.icon.title = message ? message : '';
            data.checkbox.checked = functionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = functionBreakpoint.name || '';
            let placeholder = (0, nls_1.localize)(8, null);
            let ariaLabel = (0, nls_1.localize)(9, null);
            if (data.type === 'condition') {
                data.inputBox.value = functionBreakpoint.condition || '';
                placeholder = (0, nls_1.localize)(10, null);
                ariaLabel = (0, nls_1.localize)(11, null);
            }
            else if (data.type === 'hitCount') {
                data.inputBox.value = functionBreakpoint.hitCondition || '';
                placeholder = (0, nls_1.localize)(12, null);
                ariaLabel = (0, nls_1.localize)(13, null);
            }
            data.inputBox.setAriaLabel(ariaLabel);
            data.inputBox.setPlaceHolder(placeholder);
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    FunctionBreakpointInputRenderer.ID = 'functionbreakpointinput';
    class ExceptionBreakpointInputRenderer {
        constructor(view, debugService, contextViewService, themeService) {
            this.view = view;
            this.debugService = debugService;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            // noop
        }
        get templateId() {
            return ExceptionBreakpointInputRenderer.ID;
        }
        renderTemplate(container) {
            const template = Object.create(null);
            const breakpoint = dom.append(container, $('.breakpoint'));
            breakpoint.classList.add('exception');
            template.checkbox = createCheckbox();
            dom.append(breakpoint, template.checkbox);
            this.view.breakpointInputFocused.set(true);
            const inputBoxContainer = dom.append(breakpoint, $('.inputBoxContainer'));
            const inputBox = new inputBox_1.InputBox(inputBoxContainer, this.contextViewService, {
                ariaLabel: (0, nls_1.localize)(14, null)
            });
            const styler = (0, styler_1.attachInputBoxStyler)(inputBox, this.themeService);
            const toDispose = [inputBox, styler];
            const wrapUp = (success) => {
                this.view.breakpointInputFocused.set(false);
                let newCondition = template.breakpoint.condition;
                if (success) {
                    newCondition = inputBox.value !== '' ? inputBox.value : undefined;
                }
                this.debugService.setExceptionBreakpointCondition(template.breakpoint, newCondition);
            };
            toDispose.push(dom.addStandardDisposableListener(inputBox.inputElement, 'keydown', (e) => {
                const isEscape = e.equals(9 /* Escape */);
                const isEnter = e.equals(3 /* Enter */);
                if (isEscape || isEnter) {
                    e.preventDefault();
                    e.stopPropagation();
                    wrapUp(isEnter);
                }
            }));
            toDispose.push(dom.addDisposableListener(inputBox.inputElement, 'blur', () => {
                // Need to react with a timeout on the blur event due to possible concurent splices #56443
                setTimeout(() => {
                    wrapUp(true);
                });
            }));
            template.inputBox = inputBox;
            template.toDispose = toDispose;
            return template;
        }
        renderElement(exceptionBreakpoint, _index, data) {
            const placeHolder = exceptionBreakpoint.conditionDescription || (0, nls_1.localize)(15, null);
            data.inputBox.setPlaceHolder(placeHolder);
            data.breakpoint = exceptionBreakpoint;
            data.checkbox.checked = exceptionBreakpoint.enabled;
            data.checkbox.disabled = true;
            data.inputBox.value = exceptionBreakpoint.condition || '';
            setTimeout(() => {
                data.inputBox.focus();
                data.inputBox.select();
            }, 0);
        }
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.toDispose);
        }
    }
    ExceptionBreakpointInputRenderer.ID = 'exceptionbreakpointinput';
    class BreakpointsAccessibilityProvider {
        constructor(debugService, labelService) {
            this.debugService = debugService;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(16, null);
        }
        getRole() {
            return 'checkbox';
        }
        isChecked(breakpoint) {
            return breakpoint.enabled;
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.ExceptionBreakpoint) {
                return element.toString();
            }
            const { message } = getBreakpointMessageAndIcon(this.debugService.state, this.debugService.getModel().areBreakpointsActivated(), element, this.labelService);
            const toString = element.toString();
            return message ? `${toString}, ${message}` : toString;
        }
    }
    function openBreakpointSource(breakpoint, sideBySide, preserveFocus, pinned, debugService, editorService) {
        if (breakpoint.uri.scheme === debug_1.DEBUG_SCHEME && debugService.state === 0 /* Inactive */) {
            return Promise.resolve(undefined);
        }
        const selection = breakpoint.endLineNumber ? {
            startLineNumber: breakpoint.lineNumber,
            endLineNumber: breakpoint.endLineNumber,
            startColumn: breakpoint.column || 1,
            endColumn: breakpoint.endColumn || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
        } : {
            startLineNumber: breakpoint.lineNumber,
            startColumn: breakpoint.column || 1,
            endLineNumber: breakpoint.lineNumber,
            endColumn: breakpoint.column || 1073741824 /* MAX_SAFE_SMALL_INTEGER */
        };
        return editorService.openEditor({
            resource: breakpoint.uri,
            options: {
                preserveFocus,
                selection,
                revealIfOpened: true,
                selectionRevealType: 1 /* CenterIfOutsideViewport */,
                pinned
            }
        }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
    }
    exports.openBreakpointSource = openBreakpointSource;
    function getBreakpointMessageAndIcon(state, breakpointsActivated, breakpoint, labelService) {
        const debugActive = state === 3 /* Running */ || state === 2 /* Stopped */;
        const breakpointIcon = breakpoint instanceof debugModel_1.DataBreakpoint ? icons.dataBreakpoint : breakpoint instanceof debugModel_1.FunctionBreakpoint ? icons.functionBreakpoint : breakpoint.logMessage ? icons.logBreakpoint : icons.breakpoint;
        if (!breakpoint.enabled || !breakpointsActivated) {
            return {
                icon: breakpointIcon.disabled,
                message: breakpoint.logMessage ? (0, nls_1.localize)(17, null) : (0, nls_1.localize)(18, null),
            };
        }
        const appendMessage = (text) => {
            return ('message' in breakpoint && breakpoint.message) ? text.concat(', ' + breakpoint.message) : text;
        };
        if (debugActive && !breakpoint.verified) {
            return {
                icon: breakpointIcon.unverified,
                message: ('message' in breakpoint && breakpoint.message) ? breakpoint.message : (breakpoint.logMessage ? (0, nls_1.localize)(19, null) : (0, nls_1.localize)(20, null)),
            };
        }
        if (breakpoint instanceof debugModel_1.DataBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)(21, null),
                };
            }
            return {
                icon: breakpointIcon.regular,
                message: breakpoint.message || (0, nls_1.localize)(22, null)
            };
        }
        if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
            if (!breakpoint.supported) {
                return {
                    icon: breakpointIcon.unverified,
                    message: (0, nls_1.localize)(23, null),
                };
            }
            const messages = [];
            messages.push(breakpoint.message || (0, nls_1.localize)(24, null));
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)(25, null, breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)(26, null, breakpoint.hitCondition));
            }
            return {
                icon: breakpointIcon.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        if (breakpoint.logMessage || breakpoint.condition || breakpoint.hitCondition) {
            const messages = [];
            if (!breakpoint.supported) {
                return {
                    icon: icons.debugBreakpointUnsupported,
                    message: (0, nls_1.localize)(27, null),
                };
            }
            if (breakpoint.logMessage) {
                messages.push((0, nls_1.localize)(28, null, breakpoint.logMessage));
            }
            if (breakpoint.condition) {
                messages.push((0, nls_1.localize)(29, null, breakpoint.condition));
            }
            if (breakpoint.hitCondition) {
                messages.push((0, nls_1.localize)(30, null, breakpoint.hitCondition));
            }
            return {
                icon: breakpoint.logMessage ? icons.logBreakpoint.regular : icons.conditionalBreakpoint.regular,
                message: appendMessage(messages.join('\n'))
            };
        }
        const message = ('message' in breakpoint && breakpoint.message) ? breakpoint.message : breakpoint instanceof debugModel_1.Breakpoint && labelService ? labelService.getUriLabel(breakpoint.uri) : (0, nls_1.localize)(31, null);
        return {
            icon: breakpointIcon.regular,
            message
        };
    }
    exports.getBreakpointMessageAndIcon = getBreakpointMessageAndIcon;
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.addFunctionBreakpointAction',
                title: {
                    value: (0, nls_1.localize)(32, null),
                    original: 'Add Function Breakpoint',
                    mnemonicTitle: (0, nls_1.localize)(33, null)
                },
                f1: true,
                icon: icons.watchExpressionsAddFuncBreakpoint,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 10,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.MenubarNewBreakpointMenu,
                        group: '1_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addFunctionBreakpoint();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.toggleBreakpointsActivatedAction',
                title: { value: (0, nls_1.localize)(34, null), original: 'Toggle Activate Breakpoints' },
                f1: true,
                icon: icons.breakpointsActivate,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    group: 'navigation',
                    order: 20,
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', debug_1.BREAKPOINTS_VIEW_ID)
                }
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.setBreakpointsActivated(!debugService.getModel().areBreakpointsActivated());
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeBreakpoint',
                title: (0, nls_1.localize)(35, null),
                icon: codicons_1.Codicon.removeClose,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 20,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint')
                    }]
            });
        }
        async run(accessor, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                await debugService.removeBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                await debugService.removeFunctionBreakpoints(breakpoint.getId());
            }
            else if (breakpoint instanceof debugModel_1.DataBreakpoint) {
                await debugService.removeDataBreakpoints(breakpoint.getId());
            }
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.removeAllBreakpoints',
                title: {
                    original: 'Remove All Breakpoints',
                    value: (0, nls_1.localize)(36, null),
                    mnemonicTitle: (0, nls_1.localize)(37, null)
                },
                f1: true,
                icon: icons.breakpointsRemoveAll,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 30,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', debug_1.BREAKPOINTS_VIEW_ID)
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '3_modification',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 3,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.removeBreakpoints();
            debugService.removeFunctionBreakpoints();
            debugService.removeDataBreakpoints();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.enableAllBreakpoints',
                title: {
                    original: 'Enable All Breakpoints',
                    value: (0, nls_1.localize)(38, null),
                    mnemonicTitle: (0, nls_1.localize)(39, null),
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 10,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 1,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(true);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.disableAllBreakpoints',
                title: {
                    original: 'Disable All Breakpoints',
                    value: (0, nls_1.localize)(40, null),
                    mnemonicTitle: (0, nls_1.localize)(41, null)
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 20,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }, {
                        id: actions_2.MenuId.MenubarDebugMenu,
                        group: '5_breakpoints',
                        order: 2,
                        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.enableOrDisableBreakpoints(false);
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.debug.viewlet.action.reapplyBreakpointsAction',
                title: { value: (0, nls_1.localize)(42, null), original: 'Reapply All Breakpoints' },
                f1: true,
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'z_commands',
                        order: 30,
                        when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.notEqualsTo('exceptionBreakpoint'))
                    }]
            });
        }
        async run(accessor) {
            const debugService = accessor.get(debug_1.IDebugService);
            await debugService.setBreakpointsActivated(true);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)(43, null),
                icon: codicons_1.Codicon.edit,
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 10
                    }, {
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'inline',
                        order: 10
                    }]
            });
        }
        async runInView(accessor, view, breakpoint) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            if (breakpoint instanceof debugModel_1.Breakpoint) {
                const editor = await openBreakpointSource(breakpoint, false, false, true, debugService, editorService);
                if (editor) {
                    const codeEditor = editor.getControl();
                    if ((0, editorBrowser_1.isCodeEditor)(codeEditor)) {
                        codeEditor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID).showBreakpointWidget(breakpoint.lineNumber, breakpoint.column);
                    }
                }
            }
            else if (breakpoint instanceof debugModel_1.FunctionBreakpoint) {
                const contextMenuService = accessor.get(contextView_1.IContextMenuService);
                const actions = [new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)(44, null), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'condition' })),
                    new actions_1.Action('breakpoint.editCondition', (0, nls_1.localize)(45, null), undefined, true, async () => view.renderInputBox({ breakpoint, type: 'hitCount' }))];
                const domNode = breakpointIdToActionBarDomeNode.get(breakpoint.getId());
                if (domNode) {
                    contextMenuService.showContextMenu({
                        getActions: () => actions,
                        getAnchor: () => domNode,
                        onHide: () => (0, lifecycle_1.dispose)(actions)
                    });
                }
            }
            else {
                view.renderInputBox({ breakpoint, type: 'condition' });
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpoint',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)(46, null),
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: '1_breakpoints',
                        order: 10,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'name' });
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'debug.editFunctionBreakpointHitCount',
                viewId: debug_1.BREAKPOINTS_VIEW_ID,
                title: (0, nls_1.localize)(47, null),
                precondition: debug_1.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION,
                menu: [{
                        id: actions_2.MenuId.DebugBreakpointsContext,
                        group: 'navigation',
                        order: 20,
                        when: debug_1.CONTEXT_BREAKPOINT_ITEM_TYPE.isEqualTo('functionBreakpoint')
                    }]
            });
        }
        runInView(_accessor, view, breakpoint) {
            view.renderInputBox({ breakpoint, type: 'hitCount' });
        }
    });
});
//# sourceMappingURL=breakpointsView.js.map