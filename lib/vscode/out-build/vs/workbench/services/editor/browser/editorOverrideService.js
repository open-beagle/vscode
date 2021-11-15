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
define(["require", "exports", "vs/base/common/glob", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/configuration/common/configuration", "vs/platform/editor/common/editor", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/network", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/editor/common/editorOverrideService", "vs/platform/quickinput/common/quickInput", "vs/nls!vs/workbench/services/editor/browser/editorOverrideService", "vs/base/common/codicons", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions"], function (require, exports, glob, arrays_1, lifecycle_1, resources_1, configuration_1, editor_1, editor_2, editorGroupsService_1, network_1, diffEditorInput_1, editorOverrideService_1, quickInput_1, nls_1, codicons_1, notification_1, telemetry_1, extensions_1, storage_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorOverrideService = void 0;
    let EditorOverrideService = class EditorOverrideService extends lifecycle_1.Disposable {
        constructor(editorGroupService, configurationService, quickInputService, notificationService, telemetryService, storageService, extensionService) {
            super();
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.quickInputService = quickInputService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this._contributionPoints = new Map();
            // Read in the cache on statup
            this.cache = new Set(JSON.parse(this.storageService.get(EditorOverrideService.overrideCacheStorageID, 0 /* GLOBAL */, JSON.stringify([]))));
            this.storageService.remove(EditorOverrideService.overrideCacheStorageID, 0 /* GLOBAL */);
            this._register(this.storageService.onWillSaveState(() => {
                // We want to store the glob patterns we would activate on, this allows us to know if we need to await the ext host on startup for opening a resource
                this.cacheContributionPoints();
            }));
            // When extensions have registered we no longer need the cache
            this.extensionService.onDidRegisterExtensions(() => {
                this.cache = undefined;
            });
        }
        async resolveEditorOverride(editor, options, group) {
            var _a, _b, _c;
            // If it was an override before we await for the extensions to activate and then proceed with overriding or else they won't be registered
            if (this.cache && editor.resource && this.resourceMatchesCache(editor.resource)) {
                await this.extensionService.whenInstalledExtensionsRegistered();
            }
            if ((options === null || options === void 0 ? void 0 : options.override) === editor_1.EditorOverride.DISABLED) {
                throw new Error(`Calling resolve editor override when override is explicitly disabled!`);
            }
            // Always ensure inputs have populated resource fields
            if (editor instanceof diffEditorInput_1.DiffEditorInput) {
                if ((!editor.modifiedInput.resource || !editor.originalInput.resource)) {
                    return { editor, options, group };
                }
            }
            else if (!editor.resource) {
                return { editor, options, group };
            }
            let override = typeof (options === null || options === void 0 ? void 0 : options.override) === 'string' ? options.override : undefined;
            // If the editor passed in already has a type and the user didn't explicitly override the editor choice, use the editor type.
            override = override !== null && override !== void 0 ? override : editor.viewType;
            if ((options === null || options === void 0 ? void 0 : options.override) === editor_1.EditorOverride.PICK) {
                const picked = await this.doPickEditorOverride(editor, options, group);
                // If the picker was cancelled we will stop resolving the override
                if (!picked) {
                    return;
                }
                // Deconstruct the return picked options and overrides if the user selected something
                override = picked[0].override;
                options = picked[0];
                group = (_a = picked[1]) !== null && _a !== void 0 ? _a : group;
            }
            // Resolved the override as much as possible, now find a given contribution
            const { contributionPoint, conflictingDefault } = this.getContributionPoint(editor instanceof diffEditorInput_1.DiffEditorInput ? editor.modifiedInput.resource : editor.resource, override);
            const selectedContribution = contributionPoint;
            if (!selectedContribution) {
                return { editor, options, group };
            }
            const handlesDiff = typeof ((_b = selectedContribution.options) === null || _b === void 0 ? void 0 : _b.canHandleDiff) === 'function' ? selectedContribution.options.canHandleDiff() : (_c = selectedContribution.options) === null || _c === void 0 ? void 0 : _c.canHandleDiff;
            if (editor instanceof diffEditorInput_1.DiffEditorInput && handlesDiff === false) {
                return { editor, options, group };
            }
            // If it's the currently active editor we shouldn't do anything
            if (selectedContribution.editorInfo.describes(editor)) {
                return;
            }
            const input = await this.doOverrideEditorInput(editor, options, group, selectedContribution);
            if (conflictingDefault && input) {
                // Wait one second to give the user ample time to see the current editor then ask them to configure a default
                setTimeout(() => {
                    var _a;
                    this.doHandleConflictingDefaults(selectedContribution.editorInfo.label, input.editor, (_a = input.options) !== null && _a !== void 0 ? _a : options, group);
                }, 1200);
            }
            // Add the group as we might've changed it with the quickpick
            if (input) {
                this.sendOverrideTelemetry(input.editor);
                return Object.assign(Object.assign({}, input), { group });
            }
            return input;
        }
        registerContributionPoint(globPattern, editorInfo, options, createEditorInput, createDiffEditorInput) {
            if (this._contributionPoints.get(globPattern) === undefined) {
                this._contributionPoints.set(globPattern, []);
            }
            const remove = (0, arrays_1.insert)(this._contributionPoints.get(globPattern), {
                globPattern,
                editorInfo,
                options,
                createEditorInput,
                createDiffEditorInput
            });
            return (0, lifecycle_1.toDisposable)(() => remove());
        }
        hasContributionPoint(schemeOrGlob) {
            return this._contributionPoints.has(schemeOrGlob);
        }
        getAssociationsForResource(resource) {
            const rawAssociations = this.configurationService.getValue(editorOverrideService_1.editorsAssociationsSettingId) || [];
            return rawAssociations.filter(association => association.filenamePattern && (0, editorOverrideService_1.globMatchesResource)(association.filenamePattern, resource));
        }
        updateUserAssociations(globPattern, editorID) {
            const newAssociation = { viewType: editorID, filenamePattern: globPattern };
            const currentAssociations = [...this.configurationService.getValue(editorOverrideService_1.editorsAssociationsSettingId)];
            // First try updating existing association
            for (let i = 0; i < currentAssociations.length; ++i) {
                const existing = currentAssociations[i];
                if (existing.filenamePattern === newAssociation.filenamePattern) {
                    currentAssociations.splice(i, 1, newAssociation);
                    this.configurationService.updateValue(editorOverrideService_1.editorsAssociationsSettingId, currentAssociations);
                    return;
                }
            }
            // Otherwise, create a new one
            currentAssociations.unshift(newAssociation);
            this.configurationService.updateValue(editorOverrideService_1.editorsAssociationsSettingId, currentAssociations);
        }
        findMatchingContributions(resource) {
            let contributions = [];
            // Then all glob patterns
            for (const key of this._contributionPoints.keys()) {
                const contributionPoints = this._contributionPoints.get(key);
                for (const contributionPoint of contributionPoints) {
                    if ((0, editorOverrideService_1.globMatchesResource)(key, resource)) {
                        contributions.push(contributionPoint);
                    }
                }
            }
            // Return the contributions sorted by their priority
            return contributions.sort((a, b) => (0, editorOverrideService_1.priorityToRank)(b.editorInfo.priority) - (0, editorOverrideService_1.priorityToRank)(a.editorInfo.priority));
        }
        /**
         * Given a resource and an override selects the best possible contribution point
         * @returns The contribution point and whether there was another default which conflicted with it
         */
        getContributionPoint(resource, override) {
            var _a, _b, _c, _d;
            const findMatchingContribPoint = (contributionPoints, viewType) => {
                return contributionPoints.find((contribPoint) => {
                    if (contribPoint.options && contribPoint.options.canSupportResource !== undefined) {
                        return contribPoint.editorInfo.id === viewType && contribPoint.options.canSupportResource(resource);
                    }
                    return contribPoint.editorInfo.id === viewType;
                });
            };
            if (override) {
                // Specific overried passed in doesn't have to match the reosurce, it can be anything
                const contributionPoints = (0, arrays_1.flatten)(Array.from(this._contributionPoints.values()));
                return {
                    contributionPoint: findMatchingContribPoint(contributionPoints, override),
                    conflictingDefault: false
                };
            }
            let contributionPoints = this.findMatchingContributions(resource);
            const associationsFromSetting = this.getAssociationsForResource(resource);
            // We only want built-in+ if no user defined setting is found, else we won't override
            const possibleContributionPoints = contributionPoints.filter(contribPoint => (0, editorOverrideService_1.priorityToRank)(contribPoint.editorInfo.priority) >= (0, editorOverrideService_1.priorityToRank)(editorOverrideService_1.ContributedEditorPriority.builtin) && contribPoint.editorInfo.id !== editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id);
            // If the contribution is exclusive we use that, else use the user setting, else use the built-in+ contribution
            const selectedViewType = ((_a = possibleContributionPoints[0]) === null || _a === void 0 ? void 0 : _a.editorInfo.priority) === editorOverrideService_1.ContributedEditorPriority.exclusive ?
                (_b = possibleContributionPoints[0]) === null || _b === void 0 ? void 0 : _b.editorInfo.id :
                ((_c = associationsFromSetting[0]) === null || _c === void 0 ? void 0 : _c.viewType) || ((_d = possibleContributionPoints[0]) === null || _d === void 0 ? void 0 : _d.editorInfo.id);
            let conflictingDefault = false;
            if (associationsFromSetting.length === 0 && possibleContributionPoints.length > 1) {
                conflictingDefault = true;
            }
            return {
                contributionPoint: findMatchingContribPoint(contributionPoints, selectedViewType),
                conflictingDefault
            };
        }
        async doOverrideEditorInput(editor, options, group, selectedContribution) {
            var _a, _b, _c;
            // If no activation option is provided, populate it.
            if (options && typeof options.activation === 'undefined') {
                options = Object.assign(Object.assign({}, options), { activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined });
            }
            // If it's a diff editor we trigger the create diff editor input
            if (editor instanceof diffEditorInput_1.DiffEditorInput) {
                if (!selectedContribution.createDiffEditorInput) {
                    return;
                }
                const inputWithOptions = selectedContribution.createDiffEditorInput(editor, options, group);
                return inputWithOptions;
            }
            // We only call this function from one place and there we do the check to ensure editor.resource is not undefined
            const resource = editor.resource;
            // Respect options passed back
            const inputWithOptions = selectedContribution.createEditorInput(resource, options, group);
            options = (_a = inputWithOptions.options) !== null && _a !== void 0 ? _a : options;
            const input = inputWithOptions.editor;
            // If the editor states it can only be opened once per resource we must close all existing ones first
            const singleEditorPerResource = typeof ((_b = selectedContribution.options) === null || _b === void 0 ? void 0 : _b.singlePerResource) === 'function' ? selectedContribution.options.singlePerResource() : (_c = selectedContribution.options) === null || _c === void 0 ? void 0 : _c.singlePerResource;
            if (singleEditorPerResource) {
                this.closeExistingEditorsForResource(resource, selectedContribution.editorInfo.id, group);
            }
            return { editor: input, options };
        }
        closeExistingEditorsForResource(resource, viewType, targetGroup) {
            const editorInfoForResource = this.findExistingEditorsForResource(resource, viewType);
            if (!editorInfoForResource.length) {
                return;
            }
            const editorToUse = editorInfoForResource[0];
            // Replace all other editors
            for (const { editor, group } of editorInfoForResource) {
                if (editor !== editorToUse.editor) {
                    group.closeEditor(editor);
                }
            }
            if (targetGroup.id !== editorToUse.group.id) {
                editorToUse.group.closeEditor(editorToUse.editor);
            }
            return;
        }
        /**
         * Given a resource and a viewType, returns all editors open for that resouce and viewType.
         * @param resource The resource specified
         * @param viewType The viewtype
         * @returns A list of editors
         */
        findExistingEditorsForResource(resource, viewType) {
            const out = [];
            const orderedGroups = (0, arrays_1.distinct)([
                ...this.editorGroupService.groups,
            ]);
            for (const group of orderedGroups) {
                for (const editor of group.editors) {
                    if ((0, resources_1.isEqual)(editor.resource, resource) && editor.viewType === viewType) {
                        out.push({ editor, group });
                    }
                }
            }
            return out;
        }
        async doHandleConflictingDefaults(editorName, currentEditor, options, group) {
            const makeCurrentEditorDefault = () => {
                const viewType = currentEditor.viewType;
                if (viewType) {
                    this.updateUserAssociations(`*${(0, resources_1.extname)(currentEditor.resource)}`, viewType);
                }
            };
            const handle = this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(0, null), [{
                    label: (0, nls_1.localize)(1, null),
                    run: async () => {
                        var _a, _b, _c, _d;
                        // Show the picker and tell it to update the setting to whatever the user selected
                        const picked = await this.doPickEditorOverride(currentEditor, options, group, true);
                        if (!picked) {
                            return;
                        }
                        const replacementEditor = await this.resolveEditorOverride(currentEditor, picked[0], (_a = picked[1]) !== null && _a !== void 0 ? _a : group);
                        if (!replacementEditor) {
                            return;
                        }
                        // Replace the current editor with the picked one
                        ((_c = (_b = replacementEditor.group) !== null && _b !== void 0 ? _b : picked[1]) !== null && _c !== void 0 ? _c : group).replaceEditors([
                            {
                                editor: currentEditor,
                                replacement: replacementEditor.editor,
                                options: (_d = replacementEditor.options) !== null && _d !== void 0 ? _d : picked[0],
                            }
                        ]);
                    }
                },
                {
                    label: (0, nls_1.localize)(2, null, editorName),
                    run: makeCurrentEditorDefault
                }]);
            // If the user pressed X we assume they want to keep the current editor as default
            const onCloseListener = handle.onDidClose(() => {
                makeCurrentEditorDefault();
                onCloseListener.dispose();
            });
        }
        mapContributionsToQuickPickEntry(resource, group, alwaysUpdateSetting) {
            const currentEditor = (0, arrays_1.firstOrDefault)(group.findEditors(resource));
            // If untitled, we want all contribution points
            let contributionPoints = resource.scheme === network_1.Schemas.untitled ? (0, arrays_1.distinct)((0, arrays_1.flatten)(Array.from(this._contributionPoints.values())), (contrib) => contrib.editorInfo.id) : this.findMatchingContributions(resource);
            // Not the most efficient way to do this, but we want to ensure the text editor is at the top of the quickpick
            contributionPoints = contributionPoints.sort((a, b) => {
                if (a.editorInfo.id === editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return -1;
                }
                else if (b.editorInfo.id === editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id) {
                    return 1;
                }
                else {
                    return (0, editorOverrideService_1.priorityToRank)(b.editorInfo.priority) - (0, editorOverrideService_1.priorityToRank)(a.editorInfo.priority);
                }
            });
            const contribGroups = {
                defaults: [
                    { type: 'separator', label: (0, nls_1.localize)(3, null) }
                ],
                optional: [
                    { type: 'separator', label: (0, nls_1.localize)(4, null) }
                ],
            };
            // Get the matching contribtuions and call resolve whether they're active for the picker
            contributionPoints.forEach(contribPoint => {
                var _a;
                const isActive = currentEditor ? contribPoint.editorInfo.describes(currentEditor) : false;
                const quickPickEntry = {
                    id: contribPoint.editorInfo.id,
                    label: contribPoint.editorInfo.label,
                    description: isActive ? (0, nls_1.localize)(5, null) : undefined,
                    detail: (_a = contribPoint.editorInfo.detail) !== null && _a !== void 0 ? _a : contribPoint.editorInfo.priority,
                    buttons: alwaysUpdateSetting ? [] : [{
                            iconClass: codicons_1.Codicon.gear.classNames,
                            tooltip: (0, nls_1.localize)(6, null, (0, resources_1.extname)(resource))
                        }],
                };
                if (contribPoint.editorInfo.priority === editorOverrideService_1.ContributedEditorPriority.option) {
                    contribGroups.optional.push(quickPickEntry);
                }
                else {
                    contribGroups.defaults.push(quickPickEntry);
                }
            });
            return [...contribGroups.defaults, ...contribGroups.optional];
        }
        async doPickEditorOverride(editor, options, group, alwaysUpdateSetting) {
            var _a, _b;
            const resource = editor_2.EditorResourceAccessor.getOriginalUri(editor);
            if (!resource) {
                return;
            }
            // Text editor has the lowest priority because we
            const editorOverridePicks = this.mapContributionsToQuickPickEntry(resource, group, alwaysUpdateSetting);
            // Create editor override picker
            const editorOverridePicker = this.quickInputService.createQuickPick();
            const placeHolderMessage = alwaysUpdateSetting ?
                (0, nls_1.localize)(7, null, (0, resources_1.basename)(resource)) :
                (0, nls_1.localize)(8, null, (0, resources_1.basename)(resource));
            editorOverridePicker.placeholder = placeHolderMessage;
            editorOverridePicker.canAcceptInBackground = true;
            editorOverridePicker.items = editorOverridePicks;
            const firstItem = editorOverridePicker.items.find(item => item.type === 'item');
            if (firstItem) {
                editorOverridePicker.selectedItems = [firstItem];
            }
            // Prompt the user to select an override
            const picked = await new Promise(resolve => {
                editorOverridePicker.onDidAccept(e => {
                    let result = undefined;
                    if (editorOverridePicker.selectedItems.length === 1) {
                        result = {
                            item: editorOverridePicker.selectedItems[0],
                            keyMods: editorOverridePicker.keyMods,
                            openInBackground: e.inBackground
                        };
                    }
                    // If asked to always update the setting then update it even if the gear isn't clicked
                    if (alwaysUpdateSetting && (result === null || result === void 0 ? void 0 : result.item.id)) {
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, result.item.id);
                    }
                    resolve(result);
                });
                editorOverridePicker.onDidTriggerItemButton(e => {
                    // Trigger opening and close picker
                    resolve({ item: e.item, openInBackground: false });
                    // Persist setting
                    if (resource && e.item && e.item.id) {
                        this.updateUserAssociations(`*${(0, resources_1.extname)(resource)}`, e.item.id);
                    }
                });
                editorOverridePicker.show();
            });
            // Close picker
            editorOverridePicker.dispose();
            // If the user picked an override, look at how the picker was
            // used (e.g. modifier keys, open in background) and create the
            // options and group to use accordingly
            if (picked) {
                // Figure out target group
                let targetGroup;
                if (((_a = picked.keyMods) === null || _a === void 0 ? void 0 : _a.alt) || ((_b = picked.keyMods) === null || _b === void 0 ? void 0 : _b.ctrlCmd)) {
                    const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
                    targetGroup = this.editorGroupService.findGroup({ direction }, group.id);
                    targetGroup = targetGroup !== null && targetGroup !== void 0 ? targetGroup : this.editorGroupService.addGroup(group, direction);
                }
                // Figure out options
                const targetOptions = Object.assign(Object.assign({}, options), { override: picked.item.id, preserveFocus: picked.openInBackground || (options === null || options === void 0 ? void 0 : options.preserveFocus) });
                return [targetOptions, targetGroup];
            }
            return undefined;
        }
        sendOverrideTelemetry(chosenInput) {
            if (chosenInput.viewType) {
                this.telemetryService.publicLog2('override.viewType', { viewType: chosenInput.viewType });
            }
        }
        cacheContributionPoints() {
            // Create a set to store contributed glob patterns
            const cacheStorage = new Set();
            // Store just the relative pattern pieces without any path info
            for (const globPattern of this._contributionPoints.keys()) {
                const contribPoint = this._contributionPoints.get(globPattern);
                const nonOptional = !!contribPoint.find(c => c.editorInfo.priority !== editorOverrideService_1.ContributedEditorPriority.option && c.editorInfo.id !== editorOverrideService_1.DEFAULT_EDITOR_ASSOCIATION.id);
                // Don't keep a cache of the optional ones as those wouldn't be opened on start anyways
                if (!nonOptional) {
                    continue;
                }
                if (glob.isRelativePattern(globPattern)) {
                    cacheStorage.add(`${globPattern.pattern}`);
                }
                else {
                    cacheStorage.add(globPattern);
                }
            }
            // Also store the users settings as those would have to activate on startup as well
            const userAssociations = this.configurationService.getValue(editorOverrideService_1.editorsAssociationsSettingId) || [];
            for (const association of userAssociations) {
                if (association.filenamePattern) {
                    cacheStorage.add(association.filenamePattern);
                }
            }
            this.storageService.store(EditorOverrideService.overrideCacheStorageID, JSON.stringify(Array.from(cacheStorage)), 0 /* GLOBAL */, 1 /* MACHINE */);
        }
        resourceMatchesCache(resource) {
            if (!this.cache) {
                return false;
            }
            for (const cacheEntry of this.cache) {
                if ((0, editorOverrideService_1.globMatchesResource)(cacheEntry, resource)) {
                    return true;
                }
            }
            return false;
        }
    };
    EditorOverrideService.overrideCacheStorageID = 'editorOverrideService.cache';
    EditorOverrideService = __decorate([
        __param(0, editorGroupsService_1.IEditorGroupsService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, quickInput_1.IQuickInputService),
        __param(3, notification_1.INotificationService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, storage_1.IStorageService),
        __param(6, extensions_2.IExtensionService)
    ], EditorOverrideService);
    exports.EditorOverrideService = EditorOverrideService;
    (0, extensions_1.registerSingleton)(editorOverrideService_1.IEditorOverrideService, EditorOverrideService);
});
//# sourceMappingURL=editorOverrideService.js.map