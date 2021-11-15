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
define(["require", "exports", "vs/base/common/async", "vs/base/browser/dom", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugModel", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/debug/browser/baseDebugView", "vs/platform/configuration/common/configuration", "vs/workbench/browser/parts/views/viewPane", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/base/common/filters", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/commands/common/commands", "vs/nls!vs/workbench/contrib/debug/browser/variablesView", "vs/base/common/codicons", "vs/base/common/arrays"], function (require, exports, async_1, dom, debug_1, debugModel_1, contextView_1, keybinding_1, baseDebugView_1, configuration_1, viewPane_1, instantiation_1, listService_1, filters_1, highlightedLabel_1, clipboardService_1, contextkey_1, lifecycle_1, views_1, opener_1, themeService_1, telemetry_1, types_1, actions_1, menuEntryActionViewItem_1, commands_1, nls_1, codicons_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADD_TO_WATCH_ID = exports.COPY_EVALUATE_PATH_ID = exports.BREAK_WHEN_VALUE_IS_READ_ID = exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = exports.BREAK_WHEN_VALUE_CHANGES_ID = exports.COPY_VALUE_ID = exports.SET_VARIABLE_ID = exports.VariablesRenderer = exports.VariablesDataSource = exports.VariablesView = void 0;
    const $ = dom.$;
    let forgetScopes = true;
    let variableInternalContext;
    let dataBreakpointInfoResponse;
    let VariablesView = class VariablesView extends viewPane_1.ViewPane {
        constructor(options, contextMenuService, debugService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, menuService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.debugService = debugService;
            this.needsRefresh = false;
            this.savedViewState = new Map();
            this.autoExpandedScopes = new Set();
            this.menu = menuService.createMenu(actions_1.MenuId.DebugVariablesContext, contextKeyService);
            this._register(this.menu);
            this.debugProtocolVariableMenuContext = debug_1.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT.bindTo(contextKeyService);
            this.breakWhenValueChangesSupported = debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.bindTo(contextKeyService);
            this.breakWhenValueIsAccessedSupported = debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED.bindTo(contextKeyService);
            this.breakWhenValueIsReadSupported = debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED.bindTo(contextKeyService);
            this.variableEvaluateName = debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT.bindTo(contextKeyService);
            // Use scheduler to prevent unnecessary flashing
            this.updateTreeScheduler = new async_1.RunOnceScheduler(async () => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                this.needsRefresh = false;
                const input = this.tree.getInput();
                if (input) {
                    this.savedViewState.set(input.getId(), this.tree.getViewState());
                }
                if (!stackFrame) {
                    await this.tree.setInput(null);
                    return;
                }
                const viewState = this.savedViewState.get(stackFrame.getId());
                await this.tree.setInput(stackFrame, viewState);
                // Automatically expand the first scope if it is not expensive and if all scopes are collapsed
                const scopes = await stackFrame.getScopes();
                const toExpand = scopes.find(s => !s.expensive);
                if (toExpand && (scopes.every(s => this.tree.isCollapsed(s)) || !this.autoExpandedScopes.has(toExpand.getId()))) {
                    this.autoExpandedScopes.add(toExpand.getId());
                    await this.tree.expand(toExpand);
                }
            }, 400);
        }
        renderBody(container) {
            super.renderBody(container);
            this.element.classList.add('debug-pane');
            container.classList.add('debug-variables');
            const treeContainer = (0, baseDebugView_1.renderViewTree)(container);
            this.tree = this.instantiationService.createInstance(listService_1.WorkbenchAsyncDataTree, 'VariablesView', treeContainer, new VariablesDelegate(), [this.instantiationService.createInstance(VariablesRenderer), new ScopesRenderer(), new ScopeErrorRenderer()], new VariablesDataSource(), {
                accessibilityProvider: new VariablesAccessibilityProvider(),
                identityProvider: { getId: (element) => element.getId() },
                keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e },
                overrideStyles: {
                    listBackground: this.getBackgroundColor()
                }
            });
            this.tree.setInput((0, types_1.withUndefinedAsNull)(this.debugService.getViewModel().focusedStackFrame));
            debug_1.CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
            this._register(this.debugService.getViewModel().onDidFocusStackFrame(sf => {
                if (!this.isBodyVisible()) {
                    this.needsRefresh = true;
                    return;
                }
                // Refresh the tree immediately if the user explictly changed stack frames.
                // Otherwise postpone the refresh until user stops stepping.
                const timeout = sf.explicit ? 0 : undefined;
                this.updateTreeScheduler.schedule(timeout);
            }));
            this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
                const stackFrame = this.debugService.getViewModel().focusedStackFrame;
                if (stackFrame && forgetScopes) {
                    stackFrame.forgetScopes();
                }
                forgetScopes = true;
                this.tree.updateChildren();
            }));
            this._register(this.tree.onMouseDblClick(e => this.onMouseDblClick(e)));
            this._register(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (visible && this.needsRefresh) {
                    this.updateTreeScheduler.schedule();
                }
            }));
            let horizontalScrolling;
            this._register(this.debugService.getViewModel().onDidSelectExpression(e => {
                if (e instanceof debugModel_1.Variable) {
                    horizontalScrolling = this.tree.options.horizontalScrolling;
                    if (horizontalScrolling) {
                        this.tree.updateOptions({ horizontalScrolling: false });
                    }
                    this.tree.rerender(e);
                }
                else if (!e && horizontalScrolling !== undefined) {
                    this.tree.updateOptions({ horizontalScrolling: horizontalScrolling });
                    horizontalScrolling = undefined;
                }
            }));
            this._register(this.debugService.onDidEndSession(() => {
                this.savedViewState.clear();
                this.autoExpandedScopes.clear();
            }));
        }
        layoutBody(width, height) {
            super.layoutBody(height, width);
            this.tree.layout(width, height);
        }
        focus() {
            this.tree.domFocus();
        }
        collapseAll() {
            this.tree.collapseAll();
        }
        onMouseDblClick(e) {
            const session = this.debugService.getViewModel().focusedSession;
            if (session && e.element instanceof debugModel_1.Variable && session.capabilities.supportsSetVariable) {
                this.debugService.getViewModel().setSelectedExpression(e.element);
            }
        }
        async onContextMenu(e) {
            const variable = e.element;
            if (variable instanceof debugModel_1.Variable && !!variable.value) {
                this.debugProtocolVariableMenuContext.set(variable.variableMenuContext || '');
                variableInternalContext = variable;
                const session = this.debugService.getViewModel().focusedSession;
                this.variableEvaluateName.set(!!variable.evaluateName);
                this.breakWhenValueChangesSupported.reset();
                this.breakWhenValueIsAccessedSupported.reset();
                this.breakWhenValueIsReadSupported.reset();
                if (session && session.capabilities.supportsDataBreakpoints) {
                    dataBreakpointInfoResponse = await session.dataBreakpointInfo(variable.name, variable.parent.reference);
                    const dataBreakpointId = dataBreakpointInfoResponse === null || dataBreakpointInfoResponse === void 0 ? void 0 : dataBreakpointInfoResponse.dataId;
                    const dataBreakpointAccessTypes = dataBreakpointInfoResponse === null || dataBreakpointInfoResponse === void 0 ? void 0 : dataBreakpointInfoResponse.accessTypes;
                    if (!dataBreakpointAccessTypes) {
                        // Assumes default behaviour: Supports breakWhenValueChanges
                        this.breakWhenValueChangesSupported.set(!!dataBreakpointId);
                    }
                    else {
                        dataBreakpointAccessTypes.forEach(accessType => {
                            switch (accessType) {
                                case 'read':
                                    this.breakWhenValueIsReadSupported.set(!!dataBreakpointId);
                                    break;
                                case 'write':
                                    this.breakWhenValueChangesSupported.set(!!dataBreakpointId);
                                    break;
                                case 'readWrite':
                                    this.breakWhenValueIsAccessedSupported.set(!!dataBreakpointId);
                                    break;
                            }
                        });
                    }
                }
                const context = {
                    container: variable.parent.toDebugProtocolObject(),
                    variable: variable.toDebugProtocolObject()
                };
                const actions = [];
                const actionsDisposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this.menu, { arg: context, shouldForwardArgs: false }, actions);
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    onHide: () => (0, lifecycle_1.dispose)(actionsDisposable)
                });
            }
        }
    };
    VariablesView = __decorate([
        __param(1, contextView_1.IContextMenuService),
        __param(2, debug_1.IDebugService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, opener_1.IOpenerService),
        __param(9, themeService_1.IThemeService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, actions_1.IMenuService)
    ], VariablesView);
    exports.VariablesView = VariablesView;
    function isStackFrame(obj) {
        return obj instanceof debugModel_1.StackFrame;
    }
    class VariablesDataSource {
        hasChildren(element) {
            if (!element) {
                return false;
            }
            if (isStackFrame(element)) {
                return true;
            }
            return element.hasChildren;
        }
        getChildren(element) {
            if (isStackFrame(element)) {
                return element.getScopes();
            }
            return element.getChildren();
        }
    }
    exports.VariablesDataSource = VariablesDataSource;
    class VariablesDelegate {
        getHeight(element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof debugModel_1.ErrorScope) {
                return ScopeErrorRenderer.ID;
            }
            if (element instanceof debugModel_1.Scope) {
                return ScopesRenderer.ID;
            }
            return VariablesRenderer.ID;
        }
    }
    class ScopesRenderer {
        get templateId() {
            return ScopesRenderer.ID;
        }
        renderTemplate(container) {
            const name = dom.append(container, $('.scope'));
            const label = new highlightedLabel_1.HighlightedLabel(name, false);
            return { name, label };
        }
        renderElement(element, index, templateData) {
            templateData.label.set(element.element.name, (0, filters_1.createMatches)(element.filterData));
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    ScopesRenderer.ID = 'scope';
    class ScopeErrorRenderer {
        get templateId() {
            return ScopeErrorRenderer.ID;
        }
        renderTemplate(container) {
            const wrapper = dom.append(container, $('.scope'));
            const error = dom.append(wrapper, $('.error'));
            return { error };
        }
        renderElement(element, index, templateData) {
            templateData.error.innerText = element.element.name;
        }
        disposeTemplate() {
            // noop
        }
    }
    ScopeErrorRenderer.ID = 'scopeError';
    class VariablesRenderer extends baseDebugView_1.AbstractExpressionsRenderer {
        get templateId() {
            return VariablesRenderer.ID;
        }
        renderExpression(expression, data, highlights) {
            (0, baseDebugView_1.renderVariable)(expression, data, true, highlights);
        }
        getInputBoxOptions(expression) {
            const variable = expression;
            return {
                initialValue: expression.value,
                ariaLabel: (0, nls_1.localize)(0, null),
                validationOptions: {
                    validation: () => variable.errorMessage ? ({ content: variable.errorMessage }) : null
                },
                onFinish: (value, success) => {
                    variable.errorMessage = undefined;
                    if (success && variable.value !== value) {
                        variable.setVariable(value)
                            // Need to force watch expressions and variables to update since a variable change can have an effect on both
                            .then(() => {
                            // Do not refresh scopes due to a node limitation #15520
                            forgetScopes = false;
                            this.debugService.getViewModel().updateViews();
                        });
                    }
                }
            };
        }
    }
    exports.VariablesRenderer = VariablesRenderer;
    VariablesRenderer.ID = 'variable';
    class VariablesAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(1, null);
        }
        getAriaLabel(element) {
            if (element instanceof debugModel_1.Scope) {
                return (0, nls_1.localize)(2, null, element.name);
            }
            if (element instanceof debugModel_1.Variable) {
                return (0, nls_1.localize)(3, null, element.name, element.value);
            }
            return null;
        }
    }
    exports.SET_VARIABLE_ID = 'debug.setVariable';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.SET_VARIABLE_ID,
        handler: (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.getViewModel().setSelectedExpression(variableInternalContext);
        }
    });
    exports.COPY_VALUE_ID = 'workbench.debug.viewlet.action.copyValue';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_VALUE_ID,
        handler: async (accessor, arg, ctx) => {
            const debugService = accessor.get(debug_1.IDebugService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            let elementContext = '';
            let elements;
            if (arg instanceof debugModel_1.Variable || arg instanceof debugModel_1.Expression) {
                elementContext = 'watch';
                elements = ctx ? ctx : [];
            }
            else {
                elementContext = 'variables';
                elements = variableInternalContext ? [variableInternalContext] : [];
            }
            const stackFrame = debugService.getViewModel().focusedStackFrame;
            const session = debugService.getViewModel().focusedSession;
            if (!stackFrame || !session || elements.length === 0) {
                return;
            }
            const evalContext = session.capabilities.supportsClipboardContext ? 'clipboard' : elementContext;
            const toEvaluate = elements.map(element => element instanceof debugModel_1.Variable ? (element.evaluateName || element.value) : element.name);
            try {
                const evaluations = await Promise.all(toEvaluate.map(expr => session.evaluate(expr, stackFrame.frameId, evalContext)));
                const result = (0, arrays_1.coalesce)(evaluations).map(evaluation => evaluation.body.result);
                if (result.length) {
                    clipboardService.writeText(result.join('\n'));
                }
            }
            catch (e) {
                const result = elements.map(element => element.value);
                clipboardService.writeText(result.join('\n'));
            }
        }
    });
    exports.BREAK_WHEN_VALUE_CHANGES_ID = 'debug.breakWhenValueChanges';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_CHANGES_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'write');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID = 'debug.breakWhenValueIsAccessed';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_ACCESSED_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'readWrite');
            }
        }
    });
    exports.BREAK_WHEN_VALUE_IS_READ_ID = 'debug.breakWhenValueIsRead';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.BREAK_WHEN_VALUE_IS_READ_ID,
        handler: async (accessor) => {
            const debugService = accessor.get(debug_1.IDebugService);
            if (dataBreakpointInfoResponse) {
                await debugService.addDataBreakpoint(dataBreakpointInfoResponse.description, dataBreakpointInfoResponse.dataId, !!dataBreakpointInfoResponse.canPersist, dataBreakpointInfoResponse.accessTypes, 'read');
            }
        }
    });
    exports.COPY_EVALUATE_PATH_ID = 'debug.copyEvaluatePath';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.COPY_EVALUATE_PATH_ID,
        handler: async (accessor, context) => {
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            await clipboardService.writeText(context.variable.evaluateName);
        }
    });
    exports.ADD_TO_WATCH_ID = 'debug.addToWatchExpressions';
    commands_1.CommandsRegistry.registerCommand({
        id: exports.ADD_TO_WATCH_ID,
        handler: async (accessor, context) => {
            const debugService = accessor.get(debug_1.IDebugService);
            debugService.addWatchExpression(context.variable.evaluateName);
        }
    });
    (0, actions_1.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'variables.collapse',
                viewId: debug_1.VARIABLES_VIEW_ID,
                title: (0, nls_1.localize)(4, null),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', debug_1.VARIABLES_VIEW_ID)
                }
            });
        }
        runInView(_accessor, view) {
            view.collapseAll();
        }
    });
});
//# sourceMappingURL=variablesView.js.map