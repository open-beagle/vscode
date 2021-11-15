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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugAdapterManager", "vs/base/common/event", "vs/base/common/strings", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/common/debugger", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/editorBrowser", "vs/workbench/contrib/debug/common/debugSchemas", "vs/platform/quickinput/common/quickInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/configuration/common/configuration", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/editor/common/services/modeService", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity"], function (require, exports, nls, event_1, strings, extensions_1, configuration_1, instantiation_1, commands_1, debug_1, debugger_1, editorService_1, editorBrowser_1, debugSchemas_1, quickInput_1, contextkey_1, configuration_2, platform_1, jsonContributionRegistry_1, modeService_1, dialogs_1, severity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdapterManager = void 0;
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    let AdapterManager = class AdapterManager {
        constructor(editorService, configurationService, quickInputService, instantiationService, commandService, extensionService, contextKeyService, modeService, dialogService) {
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.commandService = commandService;
            this.extensionService = extensionService;
            this.modeService = modeService;
            this.dialogService = dialogService;
            this.debugAdapterFactories = new Map();
            this._onDidRegisterDebugger = new event_1.Emitter();
            this._onDidDebuggersExtPointRead = new event_1.Emitter();
            this.breakpointModeIdsSet = new Set();
            this.adapterDescriptorFactories = [];
            this.debuggers = [];
            this.registerListeners();
            this.debuggersAvailable = debug_1.CONTEXT_DEBUGGERS_AVAILABLE.bindTo(contextKeyService);
        }
        registerListeners() {
            debugSchemas_1.debuggersExtPoint.setHandler((extensions, delta) => {
                delta.added.forEach(added => {
                    added.value.forEach(rawAdapter => {
                        if (!rawAdapter.type || (typeof rawAdapter.type !== 'string')) {
                            added.collector.error(nls.localize(0, null));
                        }
                        if (rawAdapter.type !== '*') {
                            const existing = this.getDebugger(rawAdapter.type);
                            if (existing) {
                                existing.merge(rawAdapter, added.description);
                            }
                            else {
                                this.debuggers.push(this.instantiationService.createInstance(debugger_1.Debugger, this, rawAdapter, added.description));
                            }
                        }
                    });
                });
                // take care of all wildcard contributions
                extensions.forEach(extension => {
                    extension.value.forEach(rawAdapter => {
                        if (rawAdapter.type === '*') {
                            this.debuggers.forEach(dbg => dbg.merge(rawAdapter, extension.description));
                        }
                    });
                });
                delta.removed.forEach(removed => {
                    const removedTypes = removed.value.map(rawAdapter => rawAdapter.type);
                    this.debuggers = this.debuggers.filter(d => removedTypes.indexOf(d.type) === -1);
                });
                // update the schema to include all attributes, snippets and types from extensions.
                const items = debugSchemas_1.launchSchema.properties['configurations'].items;
                items.oneOf = [];
                items.defaultSnippets = [];
                this.debuggers.forEach(adapter => {
                    const schemaAttributes = adapter.getSchemaAttributes();
                    if (schemaAttributes && items.oneOf) {
                        items.oneOf.push(...schemaAttributes);
                    }
                    const configurationSnippets = adapter.configurationSnippets;
                    if (configurationSnippets && items.defaultSnippets) {
                        items.defaultSnippets.push(...configurationSnippets);
                    }
                });
                jsonRegistry.registerSchema(configuration_2.launchSchemaId, debugSchemas_1.launchSchema);
                this._onDidDebuggersExtPointRead.fire();
            });
            debugSchemas_1.breakpointsExtPoint.setHandler((extensions, delta) => {
                delta.removed.forEach(removed => {
                    removed.value.forEach(breakpoints => this.breakpointModeIdsSet.delete(breakpoints.language));
                });
                delta.added.forEach(added => {
                    added.value.forEach(breakpoints => this.breakpointModeIdsSet.add(breakpoints.language));
                });
            });
        }
        registerDebugAdapterFactory(debugTypes, debugAdapterLauncher) {
            debugTypes.forEach(debugType => this.debugAdapterFactories.set(debugType, debugAdapterLauncher));
            this.debuggersAvailable.set(this.debugAdapterFactories.size > 0);
            this._onDidRegisterDebugger.fire();
            return {
                dispose: () => {
                    debugTypes.forEach(debugType => this.debugAdapterFactories.delete(debugType));
                }
            };
        }
        hasDebuggers() {
            return this.debugAdapterFactories.size > 0;
        }
        createDebugAdapter(session) {
            let factory = this.debugAdapterFactories.get(session.configuration.type);
            if (factory) {
                return factory.createDebugAdapter(session);
            }
            return undefined;
        }
        substituteVariables(debugType, folder, config) {
            let factory = this.debugAdapterFactories.get(debugType);
            if (factory) {
                return factory.substituteVariables(folder, config);
            }
            return Promise.resolve(config);
        }
        runInTerminal(debugType, args, sessionId) {
            let factory = this.debugAdapterFactories.get(debugType);
            if (factory) {
                return factory.runInTerminal(args, sessionId);
            }
            return Promise.resolve(void 0);
        }
        registerDebugAdapterDescriptorFactory(debugAdapterProvider) {
            this.adapterDescriptorFactories.push(debugAdapterProvider);
            return {
                dispose: () => {
                    this.unregisterDebugAdapterDescriptorFactory(debugAdapterProvider);
                }
            };
        }
        unregisterDebugAdapterDescriptorFactory(debugAdapterProvider) {
            const ix = this.adapterDescriptorFactories.indexOf(debugAdapterProvider);
            if (ix >= 0) {
                this.adapterDescriptorFactories.splice(ix, 1);
            }
        }
        getDebugAdapterDescriptor(session) {
            const config = session.configuration;
            const providers = this.adapterDescriptorFactories.filter(p => p.type === config.type && p.createDebugAdapterDescriptor);
            if (providers.length === 1) {
                return providers[0].createDebugAdapterDescriptor(session);
            }
            else {
                // TODO@AW handle n > 1 case
            }
            return Promise.resolve(undefined);
        }
        getDebuggerLabel(type) {
            const dbgr = this.getDebugger(type);
            if (dbgr) {
                return dbgr.label;
            }
            return undefined;
        }
        get onDidRegisterDebugger() {
            return this._onDidRegisterDebugger.event;
        }
        get onDidDebuggersExtPointRead() {
            return this._onDidDebuggersExtPointRead.event;
        }
        canSetBreakpointsIn(model) {
            const modeId = model.getLanguageIdentifier().language;
            if (!modeId || modeId === 'jsonc' || modeId === 'log') {
                // do not allow breakpoints in our settings files and output
                return false;
            }
            if (this.configurationService.getValue('debug').allowBreakpointsEverywhere) {
                return true;
            }
            return this.breakpointModeIdsSet.has(modeId);
        }
        getDebugger(type) {
            return this.debuggers.find(dbg => strings.equalsIgnoreCase(dbg.type, type));
        }
        isDebuggerInterestedInLanguage(language) {
            return !!this.debuggers.find(a => language && a.languages && a.languages.indexOf(language) >= 0);
        }
        async guessDebugger(gettingConfigurations, type) {
            if (type) {
                const adapter = this.getDebugger(type);
                return Promise.resolve(adapter);
            }
            const activeTextEditorControl = this.editorService.activeTextEditorControl;
            let candidates = [];
            let languageLabel = null;
            if ((0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)) {
                const model = activeTextEditorControl.getModel();
                const language = model ? model.getLanguageIdentifier().language : undefined;
                if (language) {
                    languageLabel = this.modeService.getLanguageName(language);
                }
                const adapters = this.debuggers.filter(a => language && a.languages && a.languages.indexOf(language) >= 0);
                if (adapters.length === 1) {
                    return adapters[0];
                }
                if (adapters.length > 1) {
                    candidates = adapters;
                }
            }
            if (gettingConfigurations && candidates.length === 0) {
                await this.activateDebuggers('onDebugInitialConfigurations');
                candidates = this.debuggers.filter(dbg => dbg.hasInitialConfiguration() || dbg.hasConfigurationProvider());
            }
            candidates.sort((first, second) => first.label.localeCompare(second.label));
            const picks = candidates.map(c => ({ label: c.label, debugger: c }));
            if (picks.length === 0 && languageLabel) {
                if (languageLabel.indexOf(' ') >= 0) {
                    languageLabel = `'${languageLabel}'`;
                }
                const message = nls.localize(1, null, languageLabel);
                const buttonLabel = nls.localize(2, null, languageLabel);
                const showResult = await this.dialogService.show(severity_1.default.Warning, message, [buttonLabel, nls.localize(3, null)], { cancelId: 1 });
                if (showResult.choice === 0) {
                    await this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            }
            picks.push({ type: 'separator', label: '' });
            const placeHolder = nls.localize(4, null);
            picks.push({ label: languageLabel ? nls.localize(5, null, languageLabel) : nls.localize(6, null) });
            return this.quickInputService.pick(picks, { activeItem: picks[0], placeHolder })
                .then(picked => {
                if (picked && picked.debugger) {
                    return picked.debugger;
                }
                if (picked) {
                    this.commandService.executeCommand('debug.installAdditionalDebuggers', languageLabel);
                }
                return undefined;
            });
        }
        async activateDebuggers(activationEvent, debugType) {
            const promises = [
                this.extensionService.activateByEvent(activationEvent),
                this.extensionService.activateByEvent('onDebug')
            ];
            if (debugType) {
                promises.push(this.extensionService.activateByEvent(`${activationEvent}:${debugType}`));
            }
            await Promise.all(promises);
        }
    };
    AdapterManager = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, commands_1.ICommandService),
        __param(5, extensions_1.IExtensionService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, modeService_1.IModeService),
        __param(8, dialogs_1.IDialogService)
    ], AdapterManager);
    exports.AdapterManager = AdapterManager;
});
//# sourceMappingURL=debugAdapterManager.js.map