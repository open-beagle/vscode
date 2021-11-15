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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/uri", "vs/base/common/resources", "vs/base/common/network", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/product/common/productService", "vs/workbench/contrib/welcome/gettingStarted/common/gettingStartedContent", "vs/workbench/services/experiment/common/experimentService", "vs/base/common/types", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedInput", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/configuration/common/configuration", "vs/base/common/linkedText", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedExtensionPoint", "vs/platform/instantiation/common/extensions", "vs/base/common/path"], function (require, exports, instantiation_1, event_1, storage_1, memento_1, actions_1, commands_1, contextkey_1, lifecycle_1, userDataSync_1, uri_1, resources_1, network_1, extensionManagement_1, productService_1, gettingStartedContent_1, experimentService_1, types_1, host_1, editorService_1, gettingStartedInput_1, editorGroupsService_1, configuration_1, linkedText_1, gettingStartedExtensionPoint_1, extensions_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GettingStartedService = exports.GettingStartedCategory = exports.IGettingStartedService = void 0;
    exports.IGettingStartedService = (0, instantiation_1.createDecorator)('gettingStartedService');
    var GettingStartedCategory;
    (function (GettingStartedCategory) {
        GettingStartedCategory["Beginner"] = "Beginner";
        GettingStartedCategory["Intermediate"] = "Intermediate";
        GettingStartedCategory["Advanced"] = "Advanced";
    })(GettingStartedCategory = exports.GettingStartedCategory || (exports.GettingStartedCategory = {}));
    let GettingStartedService = class GettingStartedService extends lifecycle_1.Disposable {
        constructor(storageService, commandService, contextService, userDataAutoSyncEnablementService, productService, editorService, editorGroupsService, configurationService, instantiationService, extensionManagementService, hostService, tasExperimentService) {
            super();
            this.storageService = storageService;
            this.commandService = commandService;
            this.contextService = contextService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.productService = productService;
            this.editorService = editorService;
            this.editorGroupsService = editorGroupsService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.extensionManagementService = extensionManagementService;
            this.hostService = hostService;
            this._onDidAddCategory = new event_1.Emitter();
            this.onDidAddCategory = this._onDidAddCategory.event;
            this._onDidRemoveCategory = new event_1.Emitter();
            this.onDidRemoveCategory = this._onDidRemoveCategory.event;
            this._onDidChangeCategory = new event_1.Emitter();
            this.onDidChangeCategory = this._onDidChangeCategory.event;
            this._onDidChangeStep = new event_1.Emitter();
            this.onDidChangeStep = this._onDidChangeStep.event;
            this._onDidProgressStep = new event_1.Emitter();
            this.onDidProgressStep = this._onDidProgressStep.event;
            this.commandListeners = new Map();
            this.eventListeners = new Map();
            this.gettingStartedContributions = new Map();
            this.steps = new Map();
            this.sessionInstalledExtensions = new Set();
            this.tasExperimentService = tasExperimentService;
            this.memento = new memento_1.Memento('gettingStartedService', this.storageService);
            this.stepProgress = this.memento.getMemento(0 /* GLOBAL */, 0 /* USER */);
            gettingStartedExtensionPoint_1.walkthroughsExtensionPoint.setHandler((_, { added, removed }) => {
                added.forEach(e => this.registerExtensionContributions(e.description));
                removed.forEach(e => this.unregisterExtensionContributions(e.description));
            });
            this._register(this.commandService.onDidExecuteCommand(command => this.progressByCommand(command.commandId)));
            this._register(this.extensionManagementService.onDidInstallExtension(async (e) => {
                if (await this.hostService.hadLastFocus()) {
                    this.sessionInstalledExtensions.add(e.identifier.id);
                }
            }));
            if (userDataAutoSyncEnablementService.isEnabled()) {
                this.progressByEvent('sync-enabled');
            }
            this._register(userDataAutoSyncEnablementService.onDidChangeEnablement(() => {
                if (userDataAutoSyncEnablementService.isEnabled()) {
                    this.progressByEvent('sync-enabled');
                }
            }));
            gettingStartedContent_1.startEntries.forEach(async (entry, index) => {
                var _a;
                this.getCategoryOverrides(entry);
                this.registerStartEntry(Object.assign(Object.assign({}, entry), { icon: { type: 'icon', icon: entry.icon }, order: index, when: (_a = contextkey_1.ContextKeyExpr.deserialize(entry.when)) !== null && _a !== void 0 ? _a : contextkey_1.ContextKeyExpr.true() }));
            });
            gettingStartedContent_1.walkthroughs.forEach(async (category, index) => {
                var _a;
                this.getCategoryOverrides(category);
                this.registerWalkthrough(Object.assign(Object.assign({}, category), { icon: { type: 'icon', icon: category.icon }, order: index, when: (_a = contextkey_1.ContextKeyExpr.deserialize(category.when)) !== null && _a !== void 0 ? _a : contextkey_1.ContextKeyExpr.true() }), category.content.steps.map((step, index) => {
                    var _a;
                    this.getStepOverrides(step, category.id);
                    return (Object.assign(Object.assign({}, step), { description: parseDescription(step.description), category: category.id, order: index, when: (_a = contextkey_1.ContextKeyExpr.deserialize(step.when)) !== null && _a !== void 0 ? _a : contextkey_1.ContextKeyExpr.true(), media: step.media.type === 'image'
                            ? { type: 'image', altText: step.media.altText, path: convertInternalMediaPathsToBrowserURIs(step.media.path) }
                            : { type: 'markdown', path: convertInternalMediaPathToFileURI(step.media.path), base: network_1.FileAccess.asFileUri('vs/workbench/contrib/welcome/gettingStarted/common/media/', require) } }));
                }));
            });
        }
        async getCategoryOverrides(category) {
            if (!this.tasExperimentService) {
                return;
            }
            const [title, description] = await Promise.all([
                this.tasExperimentService.getTreatment(`gettingStarted.overrideCategory.${category.id}.title`),
                this.tasExperimentService.getTreatment(`gettingStarted.overrideCategory.${category.id}.description`),
            ]);
            if (!(title || description)) {
                return;
            }
            const existing = (0, types_1.assertIsDefined)(this.gettingStartedContributions.get(category.id));
            existing.title = title !== null && title !== void 0 ? title : existing.title;
            existing.description = description !== null && description !== void 0 ? description : existing.description;
            this._onDidChangeCategory.fire(this.getCategoryProgress(existing));
        }
        async getStepOverrides(step, categoryId) {
            if (!this.tasExperimentService) {
                return;
            }
            const [title, description, media] = await Promise.all([
                this.tasExperimentService.getTreatment(`gettingStarted.overrideStep.${step.id}.title`),
                this.tasExperimentService.getTreatment(`gettingStarted.overrideStep.${step.id}.description`),
                this.tasExperimentService.getTreatment(`gettingStarted.overrideStep.${step.id}.media`),
            ]);
            if (!(title || description || media)) {
                return;
            }
            const existingCategory = (0, types_1.assertIsDefined)(this.gettingStartedContributions.get(categoryId));
            if (existingCategory.content.type === 'startEntry') {
                throw Error('Unexpected content type');
            }
            const existingStep = (0, types_1.assertIsDefined)(existingCategory.content.steps.find(_step => _step.id === step.id));
            existingStep.title = title !== null && title !== void 0 ? title : existingStep.title;
            existingStep.description = description ? parseDescription(description) : existingStep.description;
            existingStep.media.path = media ? convertInternalMediaPathsToBrowserURIs(media) : existingStep.media.path;
            this._onDidChangeStep.fire(this.getStepProgress(existingStep));
        }
        registerExtensionContributions(extension) {
            var _a, _b, _c, _d, _e;
            const convertExtensionPathToFileURI = (path) => path.startsWith('https://')
                ? uri_1.URI.parse(path, true)
                : network_1.FileAccess.asFileUri((0, resources_1.joinPath)(extension.extensionLocation, path));
            const convertExtensionRelativePathsToBrowserURIs = (path) => {
                const convertPath = (path) => path.startsWith('https://')
                    ? uri_1.URI.parse(path, true)
                    : network_1.FileAccess.asBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, path));
                if (typeof path === 'string') {
                    const converted = convertPath(path);
                    return { hc: converted, dark: converted, light: converted };
                }
                else {
                    return {
                        hc: convertPath(path.hc),
                        light: convertPath(path.light),
                        dark: convertPath(path.dark)
                    };
                }
            };
            let sectionToOpen;
            if (!((_b = (_a = extension.contributes) === null || _a === void 0 ? void 0 : _a.walkthroughs) === null || _b === void 0 ? void 0 : _b.length)) {
                return;
            }
            if (this.productService.quality === 'stable') {
                console.warn('Extension', extension.identifier.value, 'contributes welcome page content but this is a Stable build and extension contributions are only available in Insiders. The contributed content will be disregarded.');
                return;
            }
            if (!this.configurationService.getValue('workbench.welcomePage.experimental.extensionContributions')) {
                console.warn('Extension', extension.identifier.value, 'contributes welcome page content but the welcome page extension contribution feature flag has not been set. Set `workbench.welcomePage.experimental.extensionContributions` to begin using this experimental feature.');
                return;
            }
            (_c = extension.contributes.startEntries) === null || _c === void 0 ? void 0 : _c.forEach(entry => {
                var _a;
                const entryID = extension.identifier.value + '#startEntry#' + idForStartEntry(entry);
                this.registerStartEntry({
                    content: {
                        type: 'startEntry',
                        command: entry.command,
                    },
                    description: entry.description,
                    title: entry.title,
                    id: entryID,
                    order: 0,
                    when: (_a = contextkey_1.ContextKeyExpr.deserialize(entry.when)) !== null && _a !== void 0 ? _a : contextkey_1.ContextKeyExpr.true(),
                    icon: {
                        type: 'image',
                        path: extension.icon
                            ? network_1.FileAccess.asBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, extension.icon)).toString(true)
                            : extensionManagement_1.DefaultIconPath
                    }
                });
            });
            (_e = (_d = extension.contributes) === null || _d === void 0 ? void 0 : _d.walkthroughs) === null || _e === void 0 ? void 0 : _e.forEach(walkthrough => {
                var _a, _b, _c;
                const categoryID = extension.identifier.value + '#walkthrough#' + walkthrough.id;
                if (this.sessionInstalledExtensions.has(extension.identifier.value)
                    && walkthrough.primary
                    && this.contextService.contextMatchesRules((_a = contextkey_1.ContextKeyExpr.deserialize(walkthrough.when)) !== null && _a !== void 0 ? _a : contextkey_1.ContextKeyExpr.true())) {
                    this.sessionInstalledExtensions.delete(extension.identifier.value);
                    sectionToOpen = categoryID;
                }
                this.registerWalkthrough({
                    content: { type: 'steps' },
                    description: walkthrough.description,
                    title: walkthrough.title,
                    id: categoryID,
                    order: Math.min(),
                    icon: {
                        type: 'image',
                        path: extension.icon
                            ? network_1.FileAccess.asBrowserUri((0, resources_1.joinPath)(extension.extensionLocation, extension.icon)).toString(true)
                            : extensionManagement_1.DefaultIconPath
                    },
                    when: (_b = contextkey_1.ContextKeyExpr.deserialize(walkthrough.when)) !== null && _b !== void 0 ? _b : contextkey_1.ContextKeyExpr.true(),
                }, ((_c = walkthrough.steps) !== null && _c !== void 0 ? _c : walkthrough.tasks).map((step, index) => {
                    var _a, _b, _c;
                    const description = parseDescription(step.description);
                    const buttonDescription = step.button;
                    if (buttonDescription) {
                        description.push({ nodes: [{ href: (_a = buttonDescription.link) !== null && _a !== void 0 ? _a : `command:${buttonDescription.command}`, label: buttonDescription.title }] });
                    }
                    const fullyQualifiedID = extension.identifier.value + '#' + walkthrough.id + '#' + step.id;
                    let media;
                    if (typeof step.media.path === 'string' && step.media.path.endsWith('.md')) {
                        media = {
                            type: 'markdown',
                            path: convertExtensionPathToFileURI(step.media.path),
                            base: convertExtensionPathToFileURI((0, path_1.dirname)(step.media.path))
                        };
                    }
                    else {
                        const altText = step.media.altText;
                        if (!altText) {
                            console.error('Getting Started: item', fullyQualifiedID, 'is missing altText for its media element.');
                        }
                        media = { type: 'image', altText, path: convertExtensionRelativePathsToBrowserURIs(step.media.path) };
                    }
                    return ({
                        description, media,
                        doneOn: ((_b = step.doneOn) === null || _b === void 0 ? void 0 : _b.command)
                            ? { commandExecuted: step.doneOn.command }
                            : { eventFired: 'markDone:' + fullyQualifiedID },
                        id: fullyQualifiedID,
                        title: step.title,
                        when: (_c = contextkey_1.ContextKeyExpr.deserialize(step.when)) !== null && _c !== void 0 ? _c : contextkey_1.ContextKeyExpr.true(),
                        category: categoryID,
                        order: index,
                    });
                }));
            });
            if (sectionToOpen) {
                for (const group of this.editorGroupsService.groups) {
                    if (group.activeEditor instanceof gettingStartedInput_1.GettingStartedInput) {
                        group.activeEditorPane.makeCategoryVisibleWhenAvailable(sectionToOpen);
                        return;
                    }
                }
                if (this.configurationService.getValue('workbench.welcomePage.experimental.extensionContributions') === 'openToSide') {
                    this.editorService.openEditor(this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, { selectedCategory: sectionToOpen }), {}, editorService_1.SIDE_GROUP);
                }
                else if (this.configurationService.getValue('workbench.welcomePage.experimental.extensionContributions') === 'open') {
                    this.editorService.openEditor(this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, { selectedCategory: sectionToOpen }), {});
                }
                else if (this.configurationService.getValue('workbench.welcomePage.experimental.extensionContributions') === 'openInBackground') {
                    this.editorService.openEditor(this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, { selectedCategory: sectionToOpen }), { inactive: true });
                }
            }
        }
        unregisterExtensionContributions(extension) {
            var _a, _b, _c, _d, _e, _f;
            if (!((_b = (_a = extension.contributes) === null || _a === void 0 ? void 0 : _a.walkthroughs) === null || _b === void 0 ? void 0 : _b.length)) {
                return;
            }
            (_d = (_c = extension.contributes) === null || _c === void 0 ? void 0 : _c.startEntries) === null || _d === void 0 ? void 0 : _d.forEach(section => {
                const categoryID = extension.identifier.value + '#startEntry#' + idForStartEntry(section);
                this.gettingStartedContributions.delete(categoryID);
                this._onDidRemoveCategory.fire(categoryID);
            });
            (_f = (_e = extension.contributes) === null || _e === void 0 ? void 0 : _e.walkthroughs) === null || _f === void 0 ? void 0 : _f.forEach(section => {
                const categoryID = extension.identifier.value + '#walkthrough#' + section.id;
                section.steps.forEach(step => {
                    const fullyQualifiedID = extension.identifier.value + '#' + section.id + '#' + step.id;
                    this.steps.delete(fullyQualifiedID);
                });
                this.gettingStartedContributions.delete(categoryID);
                this._onDidRemoveCategory.fire(categoryID);
            });
        }
        registerDoneListeners(step) {
            if (step.doneOn.commandExecuted) {
                const existing = this.commandListeners.get(step.doneOn.commandExecuted);
                if (existing) {
                    existing.push(step.id);
                }
                else {
                    this.commandListeners.set(step.doneOn.commandExecuted, [step.id]);
                }
            }
            if (step.doneOn.eventFired) {
                const existing = this.eventListeners.get(step.doneOn.eventFired);
                if (existing) {
                    existing.push(step.id);
                }
                else {
                    this.eventListeners.set(step.doneOn.eventFired, [step.id]);
                }
            }
        }
        getCategories() {
            const registeredCategories = [...this.gettingStartedContributions.values()];
            const categoriesWithCompletion = registeredCategories
                .sort((a, b) => a.order - b.order)
                .filter(category => this.contextService.contextMatchesRules(category.when))
                .map(category => {
                if (category.content.type === 'steps') {
                    return Object.assign(Object.assign({}, category), { content: {
                            type: 'steps',
                            steps: category.content.steps.filter(step => this.contextService.contextMatchesRules(step.when))
                        } });
                }
                return category;
            })
                .filter(category => category.content.type !== 'steps' || category.content.steps.length)
                .map(category => this.getCategoryProgress(category));
            return categoriesWithCompletion;
        }
        getCategoryProgress(category) {
            if (category.content.type === 'startEntry') {
                return Object.assign(Object.assign({}, category), { content: category.content });
            }
            const stepsWithProgress = category.content.steps.map(step => this.getStepProgress(step));
            const stepsComplete = stepsWithProgress.filter(step => step.done);
            return Object.assign(Object.assign({}, category), { content: {
                    type: 'steps',
                    steps: stepsWithProgress,
                    stepsComplete: stepsComplete.length,
                    stepsTotal: stepsWithProgress.length,
                    done: stepsComplete.length === stepsWithProgress.length,
                } });
        }
        getStepProgress(step) {
            return Object.assign(Object.assign(Object.assign({}, step), { done: false }), this.stepProgress[step.id]);
        }
        progressStep(id) {
            const oldProgress = this.stepProgress[id];
            if (!oldProgress || oldProgress.done !== true) {
                this.stepProgress[id] = { done: true };
                this.memento.saveMemento();
                const step = this.getStep(id);
                this._onDidProgressStep.fire(this.getStepProgress(step));
            }
        }
        deprogressStep(id) {
            delete this.stepProgress[id];
            this.memento.saveMemento();
            const step = this.getStep(id);
            this._onDidProgressStep.fire(this.getStepProgress(step));
        }
        progressByCommand(command) {
            var _a;
            const listening = (_a = this.commandListeners.get(command)) !== null && _a !== void 0 ? _a : [];
            listening.forEach(id => this.progressStep(id));
        }
        progressByEvent(event) {
            var _a;
            const listening = (_a = this.eventListeners.get(event)) !== null && _a !== void 0 ? _a : [];
            listening.forEach(id => this.progressStep(id));
        }
        registerStartEntry(categoryDescriptor) {
            const oldCategory = this.gettingStartedContributions.get(categoryDescriptor.id);
            if (oldCategory) {
                console.error(`Skipping attempt to overwrite getting started category. (${categoryDescriptor})`);
                return;
            }
            const category = Object.assign({}, categoryDescriptor);
            this.gettingStartedContributions.set(categoryDescriptor.id, category);
            this._onDidAddCategory.fire(this.getCategoryProgress(category));
        }
        registerWalkthrough(categoryDescriptor, steps) {
            const oldCategory = this.gettingStartedContributions.get(categoryDescriptor.id);
            if (oldCategory) {
                console.error(`Skipping attempt to overwrite getting started category. (${categoryDescriptor.id})`);
                return;
            }
            const category = Object.assign(Object.assign({}, categoryDescriptor), { content: { type: 'steps', steps } });
            this.gettingStartedContributions.set(categoryDescriptor.id, category);
            steps.forEach(step => {
                if (this.steps.has(step.id)) {
                    throw Error('Attempting to register step with id ' + step.id + ' twice. Second is dropped.');
                }
                this.steps.set(step.id, step);
                this.registerDoneListeners(step);
            });
            this._onDidAddCategory.fire(this.getCategoryProgress(category));
        }
        getStep(id) {
            const step = this.steps.get(id);
            if (!step) {
                throw Error('Attempting to access step which does not exist in registry ' + id);
            }
            return step;
        }
    };
    GettingStartedService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, commands_1.ICommandService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(4, productService_1.IProductService),
        __param(5, editorService_1.IEditorService),
        __param(6, editorGroupsService_1.IEditorGroupsService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, extensionManagement_1.IExtensionManagementService),
        __param(10, host_1.IHostService),
        __param(11, (0, instantiation_1.optional)(experimentService_1.ITASExperimentService))
    ], GettingStartedService);
    exports.GettingStartedService = GettingStartedService;
    const idForStartEntry = (entry) => `${entry.title}#${entry.command}`;
    const parseDescription = (desc) => desc.split('\n').filter(x => x).map(text => (0, linkedText_1.parseLinkedText)(text));
    const convertInternalMediaPathToFileURI = (path) => path.startsWith('https://')
        ? uri_1.URI.parse(path, true)
        : network_1.FileAccess.asFileUri('vs/workbench/contrib/welcome/gettingStarted/common/media/' + path, require);
    const convertInternalMediaPathsToBrowserURIs = (path) => {
        const convertInternalMediaPathToBrowserURI = (path) => path.startsWith('https://')
            ? uri_1.URI.parse(path, true)
            : network_1.FileAccess.asBrowserUri('vs/workbench/contrib/welcome/gettingStarted/common/media/' + path, require);
        if (typeof path === 'string') {
            const converted = convertInternalMediaPathToBrowserURI(path);
            return { hc: converted, dark: converted, light: converted };
        }
        else {
            return {
                hc: convertInternalMediaPathToBrowserURI(path.hc),
                light: convertInternalMediaPathToBrowserURI(path.light),
                dark: convertInternalMediaPathToBrowserURI(path.dark)
            };
        }
    };
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'resetGettingStartedProgress',
                category: 'Getting Started',
                title: 'Reset Progress',
                f1: true
            });
        }
        run(accessor) {
            const gettingStartedService = accessor.get(exports.IGettingStartedService);
            const memento = new memento_1.Memento('gettingStartedService', accessor.get(storage_1.IStorageService));
            const record = memento.getMemento(0 /* GLOBAL */, 0 /* USER */);
            for (const key in record) {
                if (Object.prototype.hasOwnProperty.call(record, key)) {
                    try {
                        gettingStartedService.deprogressStep(key);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            memento.saveMemento();
        }
    });
    (0, extensions_1.registerSingleton)(exports.IGettingStartedService, GettingStartedService);
});
//# sourceMappingURL=gettingStartedService.js.map