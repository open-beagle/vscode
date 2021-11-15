/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/scm.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./dirtydiffDecorator", "vs/workbench/contrib/scm/common/scm", "vs/platform/actions/common/actions", "./activity", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/scm/common/scmService", "vs/workbench/common/views", "vs/workbench/contrib/scm/browser/scmViewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/editor/common/modes/modesRegistry", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/scm/browser/scmViewPane", "vs/workbench/contrib/scm/browser/scmViewService", "vs/workbench/contrib/scm/browser/scmRepositoriesViewPane", "vs/editor/contrib/suggest/suggest"], function (require, exports, nls_1, platform_1, contributions_1, dirtydiffDecorator_1, scm_1, actions_1, activity_1, configurationRegistry_1, contextkey_1, commands_1, keybindingsRegistry_1, extensions_1, scmService_1, views_1, scmViewPaneContainer_1, descriptors_1, modesRegistry_1, codicons_1, iconRegistry_1, scmViewPane_1, scmViewService_1, scmRepositoriesViewPane_1, suggest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: 'scminput',
        extensions: [],
        mimetypes: ['text/x-scm-input']
    });
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(dirtydiffDecorator_1.DirtyDiffWorkbenchController, 3 /* Restored */);
    const sourceControlViewIcon = (0, iconRegistry_1.registerIcon)('source-control-view-icon', codicons_1.Codicon.sourceControl, (0, nls_1.localize)(0, null));
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: scm_1.VIEWLET_ID,
        title: (0, nls_1.localize)(1, null),
        ctorDescriptor: new descriptors_1.SyncDescriptor(scmViewPaneContainer_1.SCMViewPaneContainer),
        storageId: 'workbench.scm.views.state',
        icon: sourceControlViewIcon,
        alwaysUseContainerInfo: true,
        order: 2,
        hideIfEmpty: true,
    }, 0 /* Sidebar */, { donotRegisterOpenCommand: true });
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(scm_1.VIEW_PANE_ID, {
        content: (0, nls_1.localize)(2, null),
        when: 'default'
    });
    viewsRegistry.registerViews([{
            id: scm_1.VIEW_PANE_ID,
            name: (0, nls_1.localize)(3, null),
            ctorDescriptor: new descriptors_1.SyncDescriptor(scmViewPane_1.SCMViewPane),
            canToggleVisibility: true,
            workspace: true,
            canMoveView: true,
            weight: 80,
            order: -999,
            containerIcon: sourceControlViewIcon,
            openCommandActionDescriptor: {
                id: viewContainer.id,
                mnemonicTitle: (0, nls_1.localize)(4, null),
                keybindings: {
                    primary: 0,
                    win: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */ },
                    linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */ },
                    mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 37 /* KEY_G */ },
                },
                order: 2,
            }
        }], viewContainer);
    viewsRegistry.registerViews([{
            id: scm_1.REPOSITORIES_VIEW_PANE_ID,
            name: (0, nls_1.localize)(5, null),
            ctorDescriptor: new descriptors_1.SyncDescriptor(scmRepositoriesViewPane_1.SCMRepositoriesViewPane),
            canToggleVisibility: true,
            hideByDefault: true,
            workspace: true,
            canMoveView: true,
            weight: 20,
            order: -1000,
            when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scm.providerCount'), contextkey_1.ContextKeyExpr.notEquals('scm.providerCount', 0)),
            // readonly when = ContextKeyExpr.or(ContextKeyExpr.equals('config.scm.alwaysShowProviders', true), ContextKeyExpr.and(ContextKeyExpr.notEquals('scm.providerCount', 0), ContextKeyExpr.notEquals('scm.providerCount', 1)));
            containerIcon: sourceControlViewIcon
        }], viewContainer);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(activity_1.SCMStatusController, 3 /* Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'scm',
        order: 5,
        title: (0, nls_1.localize)(6, null),
        type: 'object',
        scope: 4 /* RESOURCE */,
        properties: {
            'scm.diffDecorations': {
                type: 'string',
                enum: ['all', 'gutter', 'overview', 'minimap', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null)
                ],
                default: 'all',
                description: (0, nls_1.localize)(12, null)
            },
            'scm.diffDecorationsGutterWidth': {
                type: 'number',
                enum: [1, 2, 3, 4, 5],
                default: 3,
                description: (0, nls_1.localize)(13, null)
            },
            'scm.diffDecorationsGutterVisibility': {
                type: 'string',
                enum: ['always', 'hover'],
                enumDescriptions: [
                    (0, nls_1.localize)(14, null),
                    (0, nls_1.localize)(15, null)
                ],
                description: (0, nls_1.localize)(16, null),
                default: 'always'
            },
            'scm.diffDecorationsGutterAction': {
                type: 'string',
                enum: ['diff', 'none'],
                enumDescriptions: [
                    (0, nls_1.localize)(17, null),
                    (0, nls_1.localize)(18, null)
                ],
                description: (0, nls_1.localize)(19, null),
                default: 'diff'
            },
            'scm.alwaysShowActions': {
                type: 'boolean',
                description: (0, nls_1.localize)(20, null),
                default: false
            },
            'scm.countBadge': {
                type: 'string',
                enum: ['all', 'focused', 'off'],
                enumDescriptions: [
                    (0, nls_1.localize)(21, null),
                    (0, nls_1.localize)(22, null),
                    (0, nls_1.localize)(23, null)
                ],
                description: (0, nls_1.localize)(24, null),
                default: 'all'
            },
            'scm.providerCountBadge': {
                type: 'string',
                enum: ['hidden', 'auto', 'visible'],
                enumDescriptions: [
                    (0, nls_1.localize)(25, null),
                    (0, nls_1.localize)(26, null),
                    (0, nls_1.localize)(27, null)
                ],
                description: (0, nls_1.localize)(28, null),
                default: 'hidden'
            },
            'scm.defaultViewMode': {
                type: 'string',
                enum: ['tree', 'list'],
                enumDescriptions: [
                    (0, nls_1.localize)(29, null),
                    (0, nls_1.localize)(30, null)
                ],
                description: (0, nls_1.localize)(31, null),
                default: 'list'
            },
            'scm.autoReveal': {
                type: 'boolean',
                description: (0, nls_1.localize)(32, null),
                default: true
            },
            'scm.inputFontFamily': {
                type: 'string',
                markdownDescription: (0, nls_1.localize)(33, null),
                default: 'default'
            },
            'scm.inputFontSize': {
                type: 'number',
                markdownDescription: (0, nls_1.localize)(34, null),
                default: 13
            },
            'scm.alwaysShowRepositories': {
                type: 'boolean',
                markdownDescription: (0, nls_1.localize)(35, null),
                default: false
            },
            'scm.repositories.visible': {
                type: 'number',
                description: (0, nls_1.localize)(36, null),
                default: 10
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'scm.acceptInput',
        description: { description: (0, nls_1.localize)(37, null), args: [] },
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.has('scmRepository'),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        handler: accessor => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const context = contextKeyService.getContext(document.activeElement);
            const repository = context.getValue('scmRepository');
            if (!repository || !repository.provider.acceptInputCommand) {
                return Promise.resolve(null);
            }
            const id = repository.provider.acceptInputCommand.id;
            const args = repository.provider.acceptInputCommand.arguments;
            const commandService = accessor.get(commands_1.ICommandService);
            return commandService.executeCommand(id, ...(args || []));
        }
    });
    const viewNextCommitCommand = {
        description: { description: (0, nls_1.localize)(38, null), args: [] },
        weight: 200 /* WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const context = contextKeyService.getContext(document.activeElement);
            const repository = context.getValue('scmRepository');
            repository === null || repository === void 0 ? void 0 : repository.input.showNextHistoryValue();
        }
    };
    const viewPreviousCommitCommand = {
        description: { description: (0, nls_1.localize)(39, null), args: [] },
        weight: 200 /* WorkbenchContrib */,
        handler: (accessor) => {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const context = contextKeyService.getContext(document.activeElement);
            const repository = context.getValue('scmRepository');
            repository === null || repository === void 0 ? void 0 : repository.input.showPreviousHistoryValue();
        }
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign(Object.assign({}, viewNextCommitCommand), { id: 'scm.viewNextCommit', when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scmRepository'), contextkey_1.ContextKeyExpr.has('scmInputIsInLastPosition'), suggest_1.Context.Visible.toNegated()), primary: 18 /* DownArrow */ }));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign(Object.assign({}, viewPreviousCommitCommand), { id: 'scm.viewPreviousCommit', when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('scmRepository'), contextkey_1.ContextKeyExpr.has('scmInputIsInFirstPosition'), suggest_1.Context.Visible.toNegated()), primary: 16 /* UpArrow */ }));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign(Object.assign({}, viewNextCommitCommand), { id: 'scm.forceViewNextCommit', when: contextkey_1.ContextKeyExpr.has('scmRepository'), primary: 512 /* Alt */ | 18 /* DownArrow */ }));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign(Object.assign({}, viewPreviousCommitCommand), { id: 'scm.forceViewPreviousCommit', when: contextkey_1.ContextKeyExpr.has('scmRepository'), primary: 512 /* Alt */ | 16 /* UpArrow */ }));
    commands_1.CommandsRegistry.registerCommand('scm.openInTerminal', async (accessor, provider) => {
        if (!provider || !provider.rootUri) {
            return;
        }
        const commandService = accessor.get(commands_1.ICommandService);
        await commandService.executeCommand('openInTerminal', provider.rootUri);
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.SCMSourceControl, {
        group: '100_end',
        command: {
            id: 'scm.openInTerminal',
            title: (0, nls_1.localize)(40, null)
        },
        when: contextkey_1.ContextKeyExpr.equals('scmProviderHasRootUri', true)
    });
    (0, extensions_1.registerSingleton)(scm_1.ISCMService, scmService_1.SCMService);
    (0, extensions_1.registerSingleton)(scm_1.ISCMViewService, scmViewService_1.SCMViewService);
});
//# sourceMappingURL=scm.contribution.js.map