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
define(["require", "exports", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/userDataSync/common/settingsSync", "vs/platform/userDataSync/common/snippetsSync", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/environment/common/environment", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/performance", "vs/platform/userDataSync/common/ignoredExtensions", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/cancellation"], function (require, exports, storage_1, extensionsSync_1, globalStateSync_1, keybindingsSync_1, settingsSync_1, snippetsSync_1, environmentService_1, files_1, instantiation_1, log_1, userDataSyncStoreService_1, productService_1, request_1, userDataSync_1, authenticationService_1, userDataSync_2, contributions_1, platform_1, platform_2, async_1, extensionManagement_1, environment_1, extensions_1, extensionManagementUtil_1, performance_1, ignoredExtensions_1, lifecycle_1, resources_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataInitializationService = exports.IUserDataInitializationService = void 0;
    exports.IUserDataInitializationService = (0, instantiation_1.createDecorator)('IUserDataInitializationService');
    let UserDataInitializationService = class UserDataInitializationService {
        constructor(environmentService, userDataSyncStoreManagementService, fileService, storageService, productService, requestService, logService) {
            this.environmentService = environmentService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.fileService = fileService;
            this.storageService = storageService;
            this.productService = productService;
            this.requestService = requestService;
            this.logService = logService;
            this.initialized = [];
            this.initializationFinished = new async_1.Barrier();
            this.globalStateUserData = null;
            this.createUserDataSyncStoreClient().then(userDataSyncStoreClient => {
                if (!userDataSyncStoreClient) {
                    this.initializationFinished.open();
                }
            });
        }
        createUserDataSyncStoreClient() {
            if (!this._userDataSyncStoreClientPromise) {
                this._userDataSyncStoreClientPromise = (async () => {
                    var _a;
                    if (!platform_2.isWeb) {
                        this.logService.trace(`Skipping initializing user data in desktop`);
                        return;
                    }
                    if (!this.storageService.isNew(0 /* GLOBAL */)) {
                        this.logService.trace(`Skipping initializing user data as application was opened before`);
                        return;
                    }
                    if (!this.storageService.isNew(1 /* WORKSPACE */)) {
                        this.logService.trace(`Skipping initializing user data as workspace was opened before`);
                        return;
                    }
                    if (!((_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.credentialsProvider)) {
                        this.logService.trace(`Skipping initializing user data as credentials provider is not provided`);
                        return;
                    }
                    let authenticationSession;
                    try {
                        authenticationSession = await (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.environmentService, this.productService);
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                    if (!authenticationSession) {
                        this.logService.trace(`Skipping initializing user data as authentication session is not set`);
                        return;
                    }
                    await this.initializeUserDataSyncStore(authenticationSession);
                    const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
                    if (!userDataSyncStore) {
                        this.logService.trace(`Skipping initializing user data as sync service is not provided`);
                        return;
                    }
                    this.logService.info(`Using settings sync service ${userDataSyncStore.url.toString()} for initialization`);
                    const userDataSyncStoreClient = new userDataSyncStoreService_1.UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService);
                    userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                    return userDataSyncStoreClient;
                })();
            }
            return this._userDataSyncStoreClientPromise;
        }
        async initializeUserDataSyncStore(authenticationSession) {
            var _a;
            const userDataSyncStore = this.userDataSyncStoreManagementService.userDataSyncStore;
            if (!(userDataSyncStore === null || userDataSyncStore === void 0 ? void 0 : userDataSyncStore.canSwitch)) {
                return;
            }
            const disposables = new lifecycle_1.DisposableStore();
            try {
                const userDataSyncStoreClient = disposables.add(new userDataSyncStoreService_1.UserDataSyncStoreClient(userDataSyncStore.url, this.productService, this.requestService, this.logService, this.environmentService, this.fileService, this.storageService));
                userDataSyncStoreClient.setAuthToken(authenticationSession.accessToken, authenticationSession.providerId);
                // Cache global state data for global state initialization
                this.globalStateUserData = await userDataSyncStoreClient.read("globalState" /* GlobalState */, null);
                if (this.globalStateUserData) {
                    const userDataSyncStoreType = new globalStateSync_1.UserDataSyncStoreTypeSynchronizer(userDataSyncStoreClient, this.storageService, this.environmentService, this.fileService, this.logService).getSyncStoreType(this.globalStateUserData);
                    if (userDataSyncStoreType) {
                        await this.userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                        // Unset cached global state data if urls are changed
                        if (!(0, resources_1.isEqual)(userDataSyncStore.url, (_a = this.userDataSyncStoreManagementService.userDataSyncStore) === null || _a === void 0 ? void 0 : _a.url)) {
                            this.logService.info('Switched settings sync store');
                            this.globalStateUserData = null;
                        }
                    }
                }
            }
            finally {
                disposables.dispose();
            }
        }
        async whenInitializationFinished() {
            await this.initializationFinished.wait();
        }
        async requiresInitialization() {
            this.logService.trace(`UserDataInitializationService#requiresInitialization`);
            const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
            return !!userDataSyncStoreClient;
        }
        async initializeRequiredResources() {
            this.logService.trace(`UserDataInitializationService#initializeRequiredResources`);
            return this.initialize(["settings" /* Settings */, "globalState" /* GlobalState */]);
        }
        async initializeOtherResources(instantiationService) {
            try {
                this.logService.trace(`UserDataInitializationService#initializeOtherResources`);
                await async_1.Promises.allSettled([this.initialize(["keybindings" /* Keybindings */, "snippets" /* Snippets */]), this.initializeExtensions(instantiationService)]);
            }
            finally {
                this.initializationFinished.open();
            }
        }
        async initializeExtensions(instantiationService) {
            try {
                await Promise.all([this.initializeInstalledExtensions(instantiationService), this.initializeNewExtensions(instantiationService)]);
            }
            finally {
                this.initialized.push("extensions" /* Extensions */);
            }
        }
        async initializeInstalledExtensions(instantiationService) {
            if (!this.initializeInstalledExtensionsPromise) {
                this.initializeInstalledExtensionsPromise = (async () => {
                    this.logService.trace(`UserDataInitializationService#initializeInstalledExtensions`);
                    const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(InstalledExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.initializeInstalledExtensionsPromise;
        }
        async initializeNewExtensions(instantiationService) {
            if (!this.initializeNewExtensionsPromise) {
                this.initializeNewExtensionsPromise = (async () => {
                    this.logService.trace(`UserDataInitializationService#initializeNewExtensions`);
                    const extensionsPreviewInitializer = await this.getExtensionsPreviewInitializer(instantiationService);
                    if (extensionsPreviewInitializer) {
                        await instantiationService.createInstance(NewExtensionsInitializer, extensionsPreviewInitializer).initialize();
                    }
                })();
            }
            return this.initializeNewExtensionsPromise;
        }
        getExtensionsPreviewInitializer(instantiationService) {
            if (!this.extensionsPreviewInitializerPromise) {
                this.extensionsPreviewInitializerPromise = (async () => {
                    const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
                    if (!userDataSyncStoreClient) {
                        return null;
                    }
                    const userData = await userDataSyncStoreClient.read("extensions" /* Extensions */, null);
                    return instantiationService.createInstance(ExtensionsPreviewInitializer, userData);
                })();
            }
            return this.extensionsPreviewInitializerPromise;
        }
        async initialize(syncResources) {
            const userDataSyncStoreClient = await this.createUserDataSyncStoreClient();
            if (!userDataSyncStoreClient) {
                return;
            }
            await async_1.Promises.settled(syncResources.map(async (syncResource) => {
                try {
                    if (this.initialized.includes(syncResource)) {
                        this.logService.info(`${(0, userDataSync_2.getSyncAreaLabel)(syncResource)} initialized already.`);
                        return;
                    }
                    this.initialized.push(syncResource);
                    this.logService.trace(`Initializing ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                    const initializer = this.createSyncResourceInitializer(syncResource);
                    const userData = await userDataSyncStoreClient.read(syncResource, syncResource === "globalState" /* GlobalState */ ? this.globalStateUserData : null);
                    await initializer.initialize(userData);
                    this.logService.info(`Initialized ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                }
                catch (error) {
                    this.logService.info(`Error while initializing ${(0, userDataSync_2.getSyncAreaLabel)(syncResource)}`);
                    this.logService.error(error);
                }
            }));
        }
        createSyncResourceInitializer(syncResource) {
            switch (syncResource) {
                case "settings" /* Settings */: return new settingsSync_1.SettingsInitializer(this.fileService, this.environmentService, this.logService);
                case "keybindings" /* Keybindings */: return new keybindingsSync_1.KeybindingsInitializer(this.fileService, this.environmentService, this.logService);
                case "snippets" /* Snippets */: return new snippetsSync_1.SnippetsInitializer(this.fileService, this.environmentService, this.logService);
                case "globalState" /* GlobalState */: return new globalStateSync_1.GlobalStateInitializer(this.storageService, this.fileService, this.environmentService, this.logService);
            }
            throw new Error(`Cannot create initializer for ${syncResource}`);
        }
    };
    UserDataInitializationService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(2, files_1.IFileService),
        __param(3, storage_1.IStorageService),
        __param(4, productService_1.IProductService),
        __param(5, request_1.IRequestService),
        __param(6, log_1.ILogService)
    ], UserDataInitializationService);
    exports.UserDataInitializationService = UserDataInitializationService;
    let ExtensionsPreviewInitializer = class ExtensionsPreviewInitializer extends extensionsSync_1.AbstractExtensionsInitializer {
        constructor(extensionsData, extensionManagementService, ignoredExtensionsManagementService, fileService, environmentService, logService) {
            super(extensionManagementService, ignoredExtensionsManagementService, fileService, environmentService, logService);
            this.extensionsData = extensionsData;
            this.preview = null;
        }
        getPreview() {
            if (!this.previewPromise) {
                this.previewPromise = super.initialize(this.extensionsData).then(() => this.preview);
            }
            return this.previewPromise;
        }
        initialize() {
            throw new Error('should not be called directly');
        }
        async doInitialize(remoteUserData) {
            const remoteExtensions = await this.parseExtensions(remoteUserData);
            if (!remoteExtensions) {
                this.logService.info('Skipping initializing extensions because remote extensions does not exist.');
                return;
            }
            const installedExtensions = await this.extensionManagementService.getInstalled();
            this.preview = this.generatePreview(remoteExtensions, installedExtensions);
        }
    };
    ExtensionsPreviewInitializer = __decorate([
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, ignoredExtensions_1.IIgnoredExtensionsManagementService),
        __param(3, files_1.IFileService),
        __param(4, environment_1.IEnvironmentService),
        __param(5, userDataSync_1.IUserDataSyncLogService)
    ], ExtensionsPreviewInitializer);
    let InstalledExtensionsInitializer = class InstalledExtensionsInitializer {
        constructor(extensionsPreviewInitializer, extensionEnablementService, storageService, logService) {
            this.extensionsPreviewInitializer = extensionsPreviewInitializer;
            this.extensionEnablementService = extensionEnablementService;
            this.storageService = storageService;
            this.logService = logService;
        }
        async initialize() {
            const preview = await this.extensionsPreviewInitializer.getPreview();
            if (!preview) {
                return;
            }
            // 1. Initialise already installed extensions state
            for (const installedExtension of preview.installedExtensions) {
                const syncExtension = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, installedExtension.identifier));
                if (syncExtension === null || syncExtension === void 0 ? void 0 : syncExtension.state) {
                    const extensionState = (0, extensionsSync_1.getExtensionStorageState)(installedExtension.manifest.publisher, installedExtension.manifest.name, this.storageService);
                    Object.keys(syncExtension.state).forEach(key => extensionState[key] = syncExtension.state[key]);
                    (0, extensionsSync_1.storeExtensionStorageState)(installedExtension.manifest.publisher, installedExtension.manifest.name, extensionState, this.storageService);
                }
            }
            // 2. Initialise extensions enablement
            if (preview.disabledExtensions.length) {
                for (const identifier of preview.disabledExtensions) {
                    this.logService.trace(`Disabling extension...`, identifier.id);
                    await this.extensionEnablementService.disableExtension(identifier);
                    this.logService.info(`Disabling extension`, identifier.id);
                }
            }
        }
    };
    InstalledExtensionsInitializer = __decorate([
        __param(1, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(2, storage_1.IStorageService),
        __param(3, userDataSync_1.IUserDataSyncLogService)
    ], InstalledExtensionsInitializer);
    let NewExtensionsInitializer = class NewExtensionsInitializer {
        constructor(extensionsPreviewInitializer, extensionService, storageService, galleryService, extensionManagementService, logService) {
            this.extensionsPreviewInitializer = extensionsPreviewInitializer;
            this.extensionService = extensionService;
            this.storageService = storageService;
            this.galleryService = galleryService;
            this.extensionManagementService = extensionManagementService;
            this.logService = logService;
        }
        async initialize() {
            const preview = await this.extensionsPreviewInitializer.getPreview();
            if (!preview) {
                return;
            }
            const newlyEnabledExtensions = [];
            const uuids = [], names = [];
            for (const { uuid, id } of preview.newExtensions) {
                if (uuid) {
                    uuids.push(uuid);
                }
                else {
                    names.push(id);
                }
            }
            const galleryExtensions = (await this.galleryService.query({ ids: uuids, names: names, pageSize: uuids.length + names.length }, cancellation_1.CancellationToken.None)).firstPage;
            for (const galleryExtension of galleryExtensions) {
                try {
                    const extensionToSync = preview.remoteExtensions.find(({ identifier }) => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier));
                    if (!extensionToSync) {
                        continue;
                    }
                    if (extensionToSync.state) {
                        (0, extensionsSync_1.storeExtensionStorageState)(galleryExtension.publisher, galleryExtension.name, extensionToSync.state, this.storageService);
                    }
                    this.logService.trace(`Installing extension...`, galleryExtension.identifier.id);
                    const local = await this.extensionManagementService.installFromGallery(galleryExtension, { isMachineScoped: false } /* pass options to prevent install and sync dialog in web */);
                    if (!preview.disabledExtensions.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, galleryExtension.identifier))) {
                        newlyEnabledExtensions.push(local);
                    }
                    this.logService.info(`Installed extension.`, galleryExtension.identifier.id);
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            const canEnabledExtensions = newlyEnabledExtensions.filter(e => this.extensionService.canAddExtension((0, extensions_1.toExtensionDescription)(e)));
            if (!(await this.areExtensionsRunning(canEnabledExtensions))) {
                await new Promise((c, e) => {
                    const disposable = this.extensionService.onDidChangeExtensions(async () => {
                        try {
                            if (await this.areExtensionsRunning(canEnabledExtensions)) {
                                disposable.dispose();
                                c();
                            }
                        }
                        catch (error) {
                            e(error);
                        }
                    });
                });
            }
        }
        async areExtensionsRunning(extensions) {
            const runningExtensions = await this.extensionService.getExtensions();
            return extensions.every(e => runningExtensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value }, e.identifier)));
        }
    };
    NewExtensionsInitializer = __decorate([
        __param(1, extensions_1.IExtensionService),
        __param(2, storage_1.IStorageService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, userDataSync_1.IUserDataSyncLogService)
    ], NewExtensionsInitializer);
    let InitializeOtherResourcesContribution = class InitializeOtherResourcesContribution {
        constructor(userDataInitializeService, instantiationService, extensionService) {
            extensionService.whenInstalledExtensionsRegistered().then(() => this.initializeOtherResource(userDataInitializeService, instantiationService));
        }
        async initializeOtherResource(userDataInitializeService, instantiationService) {
            if (await userDataInitializeService.requiresInitialization()) {
                (0, performance_1.mark)('code/willInitOtherUserData');
                await userDataInitializeService.initializeOtherResources(instantiationService);
                (0, performance_1.mark)('code/didInitOtherUserData');
            }
        }
    };
    InitializeOtherResourcesContribution = __decorate([
        __param(0, exports.IUserDataInitializationService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, extensions_1.IExtensionService)
    ], InitializeOtherResourcesContribution);
    if (platform_2.isWeb) {
        const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
        workbenchRegistry.registerWorkbenchContribution(InitializeOtherResourcesContribution, 3 /* Restored */);
    }
});
//# sourceMappingURL=userDataInit.js.map