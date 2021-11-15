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
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/browser/gettingStarted.contribution", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStarted", "vs/platform/registry/common/platform", "vs/workbench/common/editor", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/editor", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedService", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedInput", "vs/workbench/common/contributions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/platform/product/common/product", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedIcons"], function (require, exports, nls_1, gettingStarted_1, platform_1, editor_1, actions_1, instantiation_1, contextkey_1, editorService_1, editor_2, descriptors_1, gettingStartedService_1, gettingStartedInput_1, contributions_1, configurationRegistry_1, configuration_1, product_1, icons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.icons = void 0;
    exports.icons = icons;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.showGettingStarted',
                title: (0, nls_1.localize)(0, null),
                category: (0, nls_1.localize)(1, null),
                f1: true,
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '1_welcome',
                    order: 2,
                }
            });
        }
        run(accessor) {
            accessor.get(editorService_1.IEditorService).openEditor(new gettingStartedInput_1.GettingStartedInput({}), {});
        }
    });
    platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(gettingStartedInput_1.GettingStartedInput.ID, gettingStarted_1.GettingStartedInputSerializer);
    platform_1.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(gettingStarted_1.GettingStartedPage, gettingStarted_1.GettingStartedPage.ID, (0, nls_1.localize)(2, null)), [
        new descriptors_1.SyncDescriptor(gettingStartedInput_1.GettingStartedInput)
    ]);
    const category = (0, nls_1.localize)(3, null);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'gettingStarted.goBack',
                title: (0, nls_1.localize)(4, null),
                category,
                keybinding: {
                    weight: 100 /* EditorContrib */,
                    primary: 9 /* Escape */,
                    when: gettingStarted_1.inGettingStartedContext
                },
                precondition: contextkey_1.ContextKeyEqualsExpr.create('activeEditor', 'gettingStartedPage'),
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.GettingStartedPage) {
                editorPane.escape();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'gettingStarted.next',
                title: (0, nls_1.localize)(5, null),
                category,
                keybinding: {
                    weight: 100 /* EditorContrib */,
                    primary: 18 /* DownArrow */,
                    secondary: [17 /* RightArrow */],
                    when: gettingStarted_1.inGettingStartedContext
                },
                precondition: contextkey_1.ContextKeyEqualsExpr.create('activeEditor', 'gettingStartedPage'),
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.GettingStartedPage) {
                editorPane.focusNext();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'gettingStarted.prev',
                title: (0, nls_1.localize)(6, null),
                category,
                keybinding: {
                    weight: 100 /* EditorContrib */,
                    primary: 16 /* UpArrow */,
                    secondary: [15 /* LeftArrow */],
                    when: gettingStarted_1.inGettingStartedContext
                },
                precondition: contextkey_1.ContextKeyEqualsExpr.create('activeEditor', 'gettingStartedPage'),
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorPane = editorService.activeEditorPane;
            if (editorPane instanceof gettingStarted_1.GettingStartedPage) {
                editorPane.focusPrevious();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'gettingStarted.markStepComplete',
                title: (0, nls_1.localize)(7, null),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.IGettingStartedService);
            gettingStartedService.progressStep(arg);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'gettingStarted.markStepIncomplete',
                title: (0, nls_1.localize)(8, null),
                category,
            });
        }
        run(accessor, arg) {
            if (!arg) {
                return;
            }
            const gettingStartedService = accessor.get(gettingStartedService_1.IGettingStartedService);
            gettingStartedService.deprogressStep(arg);
        }
    });
    let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
        constructor(_instantiationService, _gettingStartedService) {
            // Init the getting started service via DI.
        }
    };
    WorkbenchConfigurationContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, gettingStartedService_1.IGettingStartedService)
    ], WorkbenchConfigurationContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(WorkbenchConfigurationContribution, 3 /* Restored */);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    if (product_1.default.quality !== 'stable') {
        configurationRegistry.registerConfiguration(Object.assign(Object.assign({}, configuration_1.workbenchConfigurationNodeBase), { properties: {
                'workbench.welcomePage.experimental.extensionContributions': {
                    scope: 1 /* APPLICATION */,
                    type: 'boolean',
                    default: false,
                    description: (0, nls_1.localize)(9, null)
                }
            } }));
    }
});
//# sourceMappingURL=gettingStarted.contribution.js.map