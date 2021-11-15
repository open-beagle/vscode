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
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/extensions/browser/extensionRecommendations", "vs/platform/notification/common/notification", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/common/extensions", "vs/base/common/cancellation", "vs/nls!vs/workbench/contrib/extensions/browser/fileBasedRecommendations", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/collections", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/glob", "vs/base/common/mime", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/viewlet/browser/viewlet", "vs/editor/common/services/modelService", "vs/base/common/platform", "vs/editor/common/services/modeService", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/base/common/arrays", "vs/base/common/lifecycle"], function (require, exports, telemetry_1, extensionRecommendations_1, notification_1, extensionRecommendations_2, extensions_1, cancellation_1, nls_1, storage_1, productService_1, collections_1, network_1, resources_1, glob_1, mime_1, extensions_2, viewlet_1, modelService_1, platform_1, modeService_1, extensionRecommendations_3, arrays_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileBasedRecommendations = void 0;
    const promptedRecommendationsStorageKey = 'fileBasedRecommendations/promptedRecommendations';
    const promptedFileExtensionsStorageKey = 'fileBasedRecommendations/promptedFileExtensions';
    const recommendationsStorageKey = 'extensionsAssistant/recommendations';
    const searchMarketplace = (0, nls_1.localize)(0, null);
    const milliSecondsInADay = 1000 * 60 * 60 * 24;
    let FileBasedRecommendations = class FileBasedRecommendations extends extensionRecommendations_1.ExtensionRecommendations {
        constructor(extensionsWorkbenchService, extensionService, viewletService, modelService, modeService, productService, notificationService, telemetryService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService) {
            super();
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionService = extensionService;
            this.viewletService = viewletService;
            this.modelService = modelService;
            this.modeService = modeService;
            this.notificationService = notificationService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this.extensionTips = new Map();
            this.importantExtensionTips = new Map();
            this.fileBasedRecommendationsByPattern = new Map();
            this.fileBasedRecommendationsByLanguage = new Map();
            this.fileBasedRecommendations = new Map();
            this.processedFileExtensions = [];
            this.processedLanguages = [];
            if (productService.extensionTips) {
                (0, collections_1.forEach)(productService.extensionTips, ({ key, value }) => this.extensionTips.set(key.toLowerCase(), value));
            }
            if (productService.extensionImportantTips) {
                (0, collections_1.forEach)(productService.extensionImportantTips, ({ key, value }) => this.importantExtensionTips.set(key.toLowerCase(), value));
            }
        }
        get recommendations() {
            const recommendations = [];
            [...this.fileBasedRecommendations.keys()]
                .sort((a, b) => {
                if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
                    if (this.importantExtensionTips.has(a)) {
                        return -1;
                    }
                    if (this.importantExtensionTips.has(b)) {
                        return 1;
                    }
                }
                return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
            })
                .forEach(extensionId => {
                recommendations.push({
                    extensionId,
                    reason: {
                        reasonId: 1 /* File */,
                        reasonText: (0, nls_1.localize)(1, null)
                    }
                });
            });
            return recommendations;
        }
        get importantRecommendations() {
            return this.recommendations.filter(e => this.importantExtensionTips.has(e.extensionId));
        }
        get otherRecommendations() {
            return this.recommendations.filter(e => !this.importantExtensionTips.has(e.extensionId));
        }
        async doActivate() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const allRecommendations = [];
            // group extension recommendations by pattern, like {**/*.md} -> [ext.foo1, ext.bar2]
            for (const [extensionId, pattern] of this.extensionTips) {
                const ids = this.fileBasedRecommendationsByPattern.get(pattern) || [];
                ids.push(extensionId);
                this.fileBasedRecommendationsByPattern.set(pattern, ids);
                allRecommendations.push(extensionId);
            }
            for (const [extensionId, value] of this.importantExtensionTips) {
                if (value.pattern) {
                    const ids = this.fileBasedRecommendationsByPattern.get(value.pattern) || [];
                    ids.push(extensionId);
                    this.fileBasedRecommendationsByPattern.set(value.pattern, ids);
                }
                if (value.languages) {
                    for (const language of value.languages) {
                        const ids = this.fileBasedRecommendationsByLanguage.get(language) || [];
                        ids.push(extensionId);
                        this.fileBasedRecommendationsByLanguage.set(language, ids);
                    }
                }
                allRecommendations.push(extensionId);
            }
            const cachedRecommendations = this.getCachedRecommendations();
            const now = Date.now();
            // Retire existing recommendations if they are older than a week or are not part of this.productService.extensionTips anymore
            (0, collections_1.forEach)(cachedRecommendations, ({ key, value }) => {
                const diff = (now - value) / milliSecondsInADay;
                if (diff <= 7 && allRecommendations.indexOf(key) > -1) {
                    this.fileBasedRecommendations.set(key.toLowerCase(), { recommendedTime: value });
                }
            });
            this._register(this.modelService.onModelAdded(model => this.onModelAdded(model)));
            this.modelService.getModels().forEach(model => this.onModelAdded(model));
        }
        onModelAdded(model) {
            const uri = model.uri;
            const supportedSchemes = [network_1.Schemas.untitled, network_1.Schemas.file, network_1.Schemas.vscodeRemote];
            if (!uri || !supportedSchemes.includes(uri.scheme)) {
                return;
            }
            this.promptRecommendationsForModel(model);
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(model.onDidChangeLanguage(() => this.promptRecommendationsForModel(model)));
            disposables.add(model.onWillDispose(() => disposables.dispose()));
        }
        /**
         * Prompt the user to either install the recommended extension for the file type in the current editor model
         * or prompt to search the marketplace if it has extensions that can support the file type
         */
        promptRecommendationsForModel(model) {
            const uri = model.uri;
            const language = model.getLanguageIdentifier().language;
            const fileExtension = (0, resources_1.extname)(uri).toLowerCase();
            if (this.processedLanguages.includes(language) && this.processedFileExtensions.includes(fileExtension)) {
                return;
            }
            this.processedLanguages.push(language);
            this.processedFileExtensions.push(fileExtension);
            // re-schedule this bit of the operation to be off the critical path - in case glob-match is slow
            (0, platform_1.setImmediate)(() => this.promptRecommendations(uri, language, fileExtension));
        }
        async promptRecommendations(uri, language, fileExtension) {
            const importantRecommendations = (this.fileBasedRecommendationsByLanguage.get(language) || []).filter(extensionId => this.importantExtensionTips.has(extensionId));
            let languageName = importantRecommendations.length ? this.modeService.getLanguageName(language) : null;
            const fileBasedRecommendations = [...importantRecommendations];
            for (let [pattern, extensionIds] of this.fileBasedRecommendationsByPattern) {
                extensionIds = extensionIds.filter(extensionId => !importantRecommendations.includes(extensionId));
                if (!extensionIds.length) {
                    continue;
                }
                if (!(0, glob_1.match)(pattern, uri.toString())) {
                    continue;
                }
                for (const extensionId of extensionIds) {
                    fileBasedRecommendations.push(extensionId);
                    const importantExtensionTip = this.importantExtensionTips.get(extensionId);
                    if (importantExtensionTip && importantExtensionTip.pattern === pattern) {
                        importantRecommendations.push(extensionId);
                    }
                }
            }
            // Update file based recommendations
            for (const recommendation of fileBasedRecommendations) {
                const filedBasedRecommendation = this.fileBasedRecommendations.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
                filedBasedRecommendation.recommendedTime = Date.now();
                this.fileBasedRecommendations.set(recommendation, filedBasedRecommendation);
            }
            this.storeCachedRecommendations();
            if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
                return;
            }
            const installed = await this.extensionsWorkbenchService.queryLocal();
            if (importantRecommendations.length &&
                await this.promptRecommendedExtensionForFileType(languageName || (0, resources_1.basename)(uri), language, importantRecommendations, installed)) {
                return;
            }
            fileExtension = fileExtension.substr(1); // Strip the dot
            if (!fileExtension) {
                return;
            }
            const mimeTypes = (0, mime_1.guessMimeTypes)(uri);
            if (mimeTypes.length !== 1 || mimeTypes[0] !== mime_1.MIME_UNKNOWN) {
                return;
            }
            this.promptRecommendedExtensionForFileExtension(fileExtension, installed);
        }
        async promptRecommendedExtensionForFileType(name, language, recommendations, installed) {
            recommendations = this.filterIgnoredOrNotAllowed(recommendations);
            if (recommendations.length === 0) {
                return false;
            }
            recommendations = this.filterInstalled(recommendations, installed);
            if (recommendations.length === 0) {
                return false;
            }
            const extensionId = recommendations[0];
            const entry = this.importantExtensionTips.get(extensionId);
            if (!entry) {
                return false;
            }
            const promptedRecommendations = this.getPromptedRecommendations();
            if (promptedRecommendations[language] && promptedRecommendations[language].includes(extensionId)) {
                return false;
            }
            this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification([extensionId], (0, nls_1.localize)(2, null, name), `@id:${extensionId}`, 1 /* FILE */)
                .then(result => {
                if (result === "reacted" /* Accepted */) {
                    this.addToPromptedRecommendations(language, [extensionId]);
                }
            });
            return true;
        }
        getPromptedRecommendations() {
            return JSON.parse(this.storageService.get(promptedRecommendationsStorageKey, 0 /* GLOBAL */, '{}'));
        }
        addToPromptedRecommendations(exeName, extensions) {
            const promptedRecommendations = this.getPromptedRecommendations();
            promptedRecommendations[exeName] = extensions;
            this.storageService.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* GLOBAL */, 0 /* USER */);
        }
        getPromptedFileExtensions() {
            return JSON.parse(this.storageService.get(promptedFileExtensionsStorageKey, 0 /* GLOBAL */, '[]'));
        }
        addToPromptedFileExtensions(fileExtension) {
            const promptedFileExtensions = this.getPromptedFileExtensions();
            promptedFileExtensions.push(fileExtension);
            this.storageService.store(promptedFileExtensionsStorageKey, JSON.stringify((0, arrays_1.distinct)(promptedFileExtensions)), 0 /* GLOBAL */, 0 /* USER */);
        }
        async promptRecommendedExtensionForFileExtension(fileExtension, installed) {
            const fileExtensionSuggestionIgnoreList = JSON.parse(this.storageService.get('extensionsAssistant/fileExtensionsSuggestionIgnore', 0 /* GLOBAL */, '[]'));
            if (fileExtensionSuggestionIgnoreList.indexOf(fileExtension) > -1) {
                return;
            }
            const promptedFileExtensions = this.getPromptedFileExtensions();
            if (promptedFileExtensions.includes(fileExtension)) {
                return;
            }
            const text = `ext:${fileExtension}`;
            const pager = await this.extensionsWorkbenchService.queryGallery({ text, pageSize: 100 }, cancellation_1.CancellationToken.None);
            if (pager.firstPage.length === 0) {
                return;
            }
            const installedExtensionsIds = installed.reduce((result, i) => { result.add(i.identifier.id.toLowerCase()); return result; }, new Set());
            if (pager.firstPage.some(e => installedExtensionsIds.has(e.identifier.id.toLowerCase()))) {
                return;
            }
            this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(3, null, fileExtension), [{
                    label: searchMarketplace,
                    run: () => {
                        this.addToPromptedFileExtensions(fileExtension);
                        this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'ok', fileExtension });
                        this.viewletService.openViewlet('workbench.view.extensions', true)
                            .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
                            .then(viewlet => {
                            viewlet.search(`ext:${fileExtension}`);
                            viewlet.focus();
                        });
                    }
                }, {
                    label: (0, nls_1.localize)(4, null, fileExtension),
                    run: () => {
                        fileExtensionSuggestionIgnoreList.push(fileExtension);
                        this.storageService.store('extensionsAssistant/fileExtensionsSuggestionIgnore', JSON.stringify(fileExtensionSuggestionIgnoreList), 0 /* GLOBAL */, 0 /* USER */);
                        this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'neverShowAgain', fileExtension });
                    }
                }], {
                sticky: true,
                onCancel: () => {
                    this.telemetryService.publicLog2('fileExtensionSuggestion:popup', { userReaction: 'cancelled', fileExtension });
                }
            });
        }
        filterIgnoredOrNotAllowed(recommendationsToSuggest) {
            const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.extensionRecommendationNotificationService.ignoredRecommendations];
            return recommendationsToSuggest.filter(id => !ignoredRecommendations.includes(id));
        }
        filterInstalled(recommendationsToSuggest, installed) {
            const installedExtensionsIds = installed.reduce((result, i) => {
                if (i.enablementState !== 1 /* DisabledByExtensionKind */) {
                    result.add(i.identifier.id.toLowerCase());
                }
                return result;
            }, new Set());
            return recommendationsToSuggest.filter(id => !installedExtensionsIds.has(id.toLowerCase()));
        }
        getCachedRecommendations() {
            let storedRecommendations = JSON.parse(this.storageService.get(recommendationsStorageKey, 0 /* GLOBAL */, '[]'));
            if (Array.isArray(storedRecommendations)) {
                storedRecommendations = storedRecommendations.reduce((result, id) => { result[id] = Date.now(); return result; }, {});
            }
            const result = {};
            (0, collections_1.forEach)(storedRecommendations, ({ key, value }) => {
                if (typeof value === 'number') {
                    result[key.toLowerCase()] = value;
                }
            });
            return result;
        }
        storeCachedRecommendations() {
            const storedRecommendations = {};
            this.fileBasedRecommendations.forEach((value, key) => storedRecommendations[key] = value.recommendedTime);
            this.storageService.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* GLOBAL */, 1 /* MACHINE */);
        }
    };
    FileBasedRecommendations = __decorate([
        __param(0, extensions_1.IExtensionsWorkbenchService),
        __param(1, extensions_2.IExtensionService),
        __param(2, viewlet_1.IViewletService),
        __param(3, modelService_1.IModelService),
        __param(4, modeService_1.IModeService),
        __param(5, productService_1.IProductService),
        __param(6, notification_1.INotificationService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, storage_1.IStorageService),
        __param(9, extensionRecommendations_3.IExtensionRecommendationNotificationService),
        __param(10, extensionRecommendations_2.IExtensionIgnoredRecommendationsService)
    ], FileBasedRecommendations);
    exports.FileBasedRecommendations = FileBasedRecommendations;
});
//# sourceMappingURL=fileBasedRecommendations.js.map