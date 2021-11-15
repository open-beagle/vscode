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
define(["require", "exports", "vs/nls!vs/workbench/contrib/output/browser/output.contribution", "vs/base/browser/ui/aria/aria", "vs/base/common/keyCodes", "vs/editor/common/modes/modesRegistry", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/output/browser/outputServices", "vs/workbench/contrib/output/common/output", "vs/workbench/contrib/output/browser/outputView", "vs/workbench/browser/editor", "vs/workbench/contrib/output/browser/logViewer", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/contributions", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/resolverService", "vs/workbench/common/views", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/configuration/common/configurationRegistry", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/base/common/types", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/actions", "vs/workbench/common/editor", "vs/css!./media/output"], function (require, exports, nls, aria, keyCodes_1, modesRegistry_1, platform_1, actions_1, extensions_1, outputServices_1, output_1, outputView_1, editor_1, logViewer_1, descriptors_1, contributions_1, instantiation_1, resolverService_1, views_1, viewPaneContainer_1, configurationRegistry_1, quickInput_1, editorService_1, types_1, contextkey_1, codicons_1, iconRegistry_1, actions_2, editor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register Service
    (0, extensions_1.registerSingleton)(output_1.IOutputService, outputServices_1.OutputService);
    // Register Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.OUTPUT_MODE_ID,
        extensions: [],
        mimetypes: [output_1.OUTPUT_MIME]
    });
    // Register Log Output Mode
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: output_1.LOG_MODE_ID,
        extensions: [],
        mimetypes: [output_1.LOG_MIME]
    });
    // register output container
    const outputViewIcon = (0, iconRegistry_1.registerIcon)('output-view-icon', codicons_1.Codicon.output, nls.localize(0, null));
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: output_1.OUTPUT_VIEW_ID,
        title: nls.localize(1, null),
        icon: outputViewIcon,
        order: 1,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [output_1.OUTPUT_VIEW_ID, { mergeViewWithContainerWhenSingleView: true, donotShowContainerTitleWhenMergedWithContainer: true }]),
        storageId: output_1.OUTPUT_VIEW_ID,
        hideIfEmpty: true,
    }, 1 /* Panel */, { donotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: output_1.OUTPUT_VIEW_ID,
            name: nls.localize(2, null),
            containerIcon: outputViewIcon,
            canMoveView: true,
            canToggleVisibility: false,
            ctorDescriptor: new descriptors_1.SyncDescriptor(outputView_1.OutputViewPane),
            openCommandActionDescriptor: {
                id: 'workbench.action.output.toggleOutput',
                mnemonicTitle: nls.localize(3, null),
                keybindings: {
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 51 /* KEY_U */,
                    linux: {
                        primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 38 /* KEY_H */) // On Ubuntu Ctrl+Shift+U is taken by some global OS command
                    }
                },
                order: 1,
            }
        }], VIEW_CONTAINER);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(logViewer_1.LogViewer, logViewer_1.LogViewer.LOG_VIEWER_EDITOR_ID, nls.localize(4, null)), [
        new descriptors_1.SyncDescriptor(logViewer_1.LogViewerInput)
    ]);
    let OutputContribution = class OutputContribution {
        constructor(instantiationService, textModelService) {
            textModelService.registerTextModelContentProvider(output_1.LOG_SCHEME, instantiationService.createInstance(outputServices_1.LogContentProvider));
        }
    };
    OutputContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, resolverService_1.ITextModelService)
    ], OutputContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(OutputContribution, 3 /* Restored */);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: `workbench.output.action.switchBetweenOutputs`,
                title: nls.localize(5, null),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', output_1.OUTPUT_VIEW_ID),
                    group: 'navigation',
                    order: 1
                },
            });
        }
        async run(accessor, channelId) {
            if (typeof channelId === 'string') {
                // Sometimes the action is executed with no channelId parameter, then we should just ignore it #103496
                accessor.get(output_1.IOutputService).showChannel(channelId, true);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: `workbench.output.action.clearOutput`,
                title: { value: nls.localize(6, null), original: 'Clear Output' },
                category: actions_2.CATEGORIES.View,
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', output_1.OUTPUT_VIEW_ID),
                        group: 'navigation',
                        order: 2
                    }, {
                        id: actions_1.MenuId.CommandPalette
                    }, {
                        id: actions_1.MenuId.EditorContext,
                        when: output_1.CONTEXT_IN_OUTPUT
                    }],
                icon: codicons_1.Codicon.clearAll
            });
        }
        async run(accessor) {
            const outputService = accessor.get(output_1.IOutputService);
            const activeChannel = outputService.getActiveChannel();
            if (activeChannel) {
                activeChannel.clear();
                aria.status(nls.localize(7, null));
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: `workbench.output.action.toggleAutoScroll`,
                title: { value: nls.localize(8, null), original: 'Toggle Auto Scrolling' },
                tooltip: nls.localize(9, null),
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', output_1.OUTPUT_VIEW_ID)),
                    group: 'navigation',
                    order: 3,
                },
                icon: codicons_1.Codicon.unlock,
                toggled: {
                    condition: output_1.CONTEXT_OUTPUT_SCROLL_LOCK,
                    icon: codicons_1.Codicon.lock,
                    tooltip: nls.localize(10, null)
                }
            });
        }
        async run(accessor) {
            const outputView = accessor.get(views_1.IViewsService).getActiveViewWithId(output_1.OUTPUT_VIEW_ID);
            outputView.scrollLock = !outputView.scrollLock;
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: `workbench.action.openActiveLogOutputFile`,
                title: { value: nls.localize(11, null), original: 'Open Log Output File' },
                menu: [{
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', output_1.OUTPUT_VIEW_ID),
                        group: 'navigation',
                        order: 4
                    }, {
                        id: actions_1.MenuId.CommandPalette,
                        when: output_1.CONTEXT_ACTIVE_LOG_OUTPUT,
                    }],
                icon: codicons_1.Codicon.goToFile,
                precondition: output_1.CONTEXT_ACTIVE_LOG_OUTPUT
            });
        }
        async run(accessor) {
            const outputService = accessor.get(output_1.IOutputService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const logFileOutputChannelDescriptor = this.getLogFileOutputChannelDescriptor(outputService);
            if (logFileOutputChannelDescriptor) {
                await editorService.openEditor(instantiationService.createInstance(logViewer_1.LogViewerInput, logFileOutputChannelDescriptor), { pinned: true });
            }
        }
        getLogFileOutputChannelDescriptor(outputService) {
            const channel = outputService.getActiveChannel();
            if (channel) {
                const descriptor = outputService.getChannelDescriptors().filter(c => c.id === channel.id)[0];
                if (descriptor && descriptor.file && descriptor.log) {
                    return descriptor;
                }
            }
            return null;
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.showLogs',
                title: { value: nls.localize(12, null), original: 'Show Logs...' },
                category: actions_2.CATEGORIES.Developer,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                },
            });
        }
        async run(accessor) {
            const outputService = accessor.get(output_1.IOutputService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const entries = outputService.getChannelDescriptors().filter(c => c.file && c.log)
                .map(({ id, label }) => ({ id, label }));
            const entry = await quickInputService.pick(entries, { placeHolder: nls.localize(13, null) });
            if (entry) {
                return outputService.showChannel(entry.id);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.openLogFile',
                title: { value: nls.localize(14, null), original: 'Open Log File...' },
                category: actions_2.CATEGORIES.Developer,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                },
            });
        }
        async run(accessor) {
            const outputService = accessor.get(output_1.IOutputService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const entries = outputService.getChannelDescriptors().filter(c => c.file && c.log)
                .map(channel => ({ id: channel.id, label: channel.label, channel }));
            const entry = await quickInputService.pick(entries, { placeHolder: nls.localize(15, null) });
            if (entry) {
                (0, types_1.assertIsDefined)(entry.channel.file);
                await editorService.openEditor(instantiationService.createInstance(logViewer_1.LogViewerInput, entry.channel), { pinned: true });
            }
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'output',
        order: 30,
        title: nls.localize(16, null),
        type: 'object',
        properties: {
            'output.smartScroll.enabled': {
                type: 'boolean',
                description: nls.localize(17, null),
                default: true,
                scope: 3 /* WINDOW */,
                tags: ['output']
            }
        }
    });
});
//# sourceMappingURL=output.contribution.js.map