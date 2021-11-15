/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/request/common/request", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/buffer", "vs/base/common/uuid", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetry", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/environment/common/environment", "vs/platform/storage/common/storage", "vs/base/common/uri", "vs/base/common/resources", "vs/platform/userDataSync/common/userDataSyncResourceEnablementService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/configuration/common/configurationService", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSyncBackupStoreService", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/extensionsStorageSync"], function (require, exports, request_1, userDataSync_1, buffer_1, uuid_1, userDataSyncService_1, instantiationServiceMock_1, configuration_1, log_1, userDataSyncStoreService_1, telemetryUtils_1, telemetry_1, files_1, fileService_1, network_1, environment_1, storage_1, uri_1, resources_1, userDataSyncResourceEnablementService_1, extensionManagement_1, extensionEnablementService_1, inMemoryFilesystemProvider_1, configurationService_1, lifecycle_1, event_1, userDataSyncAccount_1, product_1, productService_1, userDataSyncBackupStoreService_1, userDataSyncMachines_1, userDataAutoSyncService_1, ignoredExtensions_1, extensionsStorageSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestUserDataSyncUtilService = exports.UserDataSyncTestServer = exports.UserDataSyncClient = void 0;
    class UserDataSyncClient extends lifecycle_1.Disposable {
        constructor(testServer = new UserDataSyncTestServer()) {
            super();
            this.testServer = testServer;
            this.instantiationService = new instantiationServiceMock_1.TestInstantiationService();
        }
        async setUp(empty = false) {
            (0, userDataSync_1.registerConfiguration)();
            const userRoamingDataHome = uri_1.URI.file('userdata').with({ scheme: network_1.Schemas.inMemory });
            const userDataSyncHome = (0, resources_1.joinPath)(userRoamingDataHome, '.sync');
            const environmentService = this.instantiationService.stub(environment_1.IEnvironmentService, {
                userDataSyncHome,
                userRoamingDataHome,
                settingsResource: (0, resources_1.joinPath)(userRoamingDataHome, 'settings.json'),
                keybindingsResource: (0, resources_1.joinPath)(userRoamingDataHome, 'keybindings.json'),
                snippetsHome: (0, resources_1.joinPath)(userRoamingDataHome, 'snippets'),
                argvResource: (0, resources_1.joinPath)(userRoamingDataHome, 'argv.json'),
                sync: 'on',
            });
            const logService = new log_1.NullLogService();
            this.instantiationService.stub(log_1.ILogService, logService);
            this.instantiationService.stub(productService_1.IProductService, Object.assign(Object.assign({ _serviceBrand: undefined }, product_1.default), {
                'configurationSync.store': {
                    url: this.testServer.url,
                    stableUrl: this.testServer.url,
                    insidersUrl: this.testServer.url,
                    canSwitch: false,
                    authenticationProviders: { 'test': { scopes: [] } }
                }
            }));
            const fileService = this._register(new fileService_1.FileService(logService));
            fileService.registerProvider(network_1.Schemas.inMemory, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            this.instantiationService.stub(files_1.IFileService, fileService);
            this.instantiationService.stub(storage_1.IStorageService, this._register(new storage_1.InMemoryStorageService()));
            const configurationService = this._register(new configurationService_1.ConfigurationService(environmentService.settingsResource, fileService));
            await configurationService.initialize();
            this.instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            this.instantiationService.stub(request_1.IRequestService, this.testServer);
            this.instantiationService.stub(userDataSync_1.IUserDataSyncLogService, logService);
            this.instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            this.instantiationService.stub(userDataSync_1.IUserDataSyncStoreManagementService, this._register(this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreManagementService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncStoreService, this._register(this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreService)));
            const userDataSyncAccountService = this._register(this.instantiationService.createInstance(userDataSyncAccount_1.UserDataSyncAccountService));
            await userDataSyncAccountService.updateAccount({ authenticationProviderId: 'authenticationProviderId', token: 'token' });
            this.instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, userDataSyncAccountService);
            this.instantiationService.stub(userDataSyncMachines_1.IUserDataSyncMachinesService, this._register(this.instantiationService.createInstance(userDataSyncMachines_1.UserDataSyncMachinesService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncBackupStoreService, this._register(this.instantiationService.createInstance(userDataSyncBackupStoreService_1.UserDataSyncBackupStoreService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncUtilService, new TestUserDataSyncUtilService());
            this.instantiationService.stub(userDataSync_1.IUserDataSyncResourceEnablementService, this._register(this.instantiationService.createInstance(userDataSyncResourceEnablementService_1.UserDataSyncResourceEnablementService)));
            this.instantiationService.stub(extensionManagement_1.IGlobalExtensionEnablementService, this._register(this.instantiationService.createInstance(extensionEnablementService_1.GlobalExtensionEnablementService)));
            this.instantiationService.stub(extensionsStorageSync_1.IExtensionsStorageSyncService, this._register(this.instantiationService.createInstance(extensionsStorageSync_1.ExtensionsStorageSyncService)));
            this.instantiationService.stub(ignoredExtensions_1.IIgnoredExtensionsManagementService, this.instantiationService.createInstance(ignoredExtensions_1.IgnoredExtensionsManagementService));
            this.instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                async getInstalled() { return []; },
                onDidInstallExtension: new event_1.Emitter().event,
                onDidUninstallExtension: new event_1.Emitter().event,
            });
            this.instantiationService.stub(extensionManagement_1.IExtensionGalleryService, {
                isEnabled() { return true; },
                async getCompatibleExtension() { return null; }
            });
            this.instantiationService.stub(userDataSync_1.IUserDataAutoSyncEnablementService, this._register(this.instantiationService.createInstance(userDataAutoSyncService_1.UserDataAutoSyncEnablementService)));
            this.instantiationService.stub(userDataSync_1.IUserDataSyncService, this._register(this.instantiationService.createInstance(userDataSyncService_1.UserDataSyncService)));
            if (!empty) {
                await fileService.writeFile(environmentService.settingsResource, buffer_1.VSBuffer.fromString(JSON.stringify({})));
                await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString(JSON.stringify([])));
                await fileService.writeFile((0, resources_1.joinPath)(environmentService.snippetsHome, 'c.json'), buffer_1.VSBuffer.fromString(`{}`));
                await fileService.writeFile(environmentService.argvResource, buffer_1.VSBuffer.fromString(JSON.stringify({ 'locale': 'en' })));
            }
            await configurationService.reloadConfiguration();
        }
        async sync() {
            await (await this.instantiationService.get(userDataSync_1.IUserDataSyncService).createSyncTask()).run();
        }
        read(resource) {
            return this.instantiationService.get(userDataSync_1.IUserDataSyncStoreService).read(resource, null);
        }
        manifest() {
            return this.instantiationService.get(userDataSync_1.IUserDataSyncStoreService).manifest();
        }
    }
    exports.UserDataSyncClient = UserDataSyncClient;
    const ALL_SERVER_RESOURCES = [...userDataSync_1.ALL_SYNC_RESOURCES, 'machines'];
    class UserDataSyncTestServer {
        constructor(rateLimit = Number.MAX_SAFE_INTEGER, retryAfter) {
            this.rateLimit = rateLimit;
            this.retryAfter = retryAfter;
            this.url = 'http://host:3000';
            this.session = null;
            this.data = new Map();
            this._requests = [];
            this._requestsWithAllHeaders = [];
            this._responses = [];
        }
        get requests() { return this._requests; }
        get requestsWithAllHeaders() { return this._requestsWithAllHeaders; }
        get responses() { return this._responses; }
        reset() { this._requests = []; this._responses = []; this._requestsWithAllHeaders = []; }
        async resolveProxy(url) { return url; }
        async request(options, token) {
            if (this._requests.length === this.rateLimit) {
                return this.toResponse(429, this.retryAfter ? { 'retry-after': `${this.retryAfter}` } : undefined);
            }
            const headers = {};
            if (options.headers) {
                if (options.headers['If-None-Match']) {
                    headers['If-None-Match'] = options.headers['If-None-Match'];
                }
                if (options.headers['If-Match']) {
                    headers['If-Match'] = options.headers['If-Match'];
                }
            }
            this._requests.push({ url: options.url, type: options.type, headers });
            this._requestsWithAllHeaders.push({ url: options.url, type: options.type, headers: options.headers });
            const requestContext = await this.doRequest(options);
            this._responses.push({ status: requestContext.res.statusCode });
            return requestContext;
        }
        async doRequest(options) {
            const versionUrl = `${this.url}/v1/`;
            const relativePath = options.url.indexOf(versionUrl) === 0 ? options.url.substring(versionUrl.length) : undefined;
            const segments = relativePath ? relativePath.split('/') : [];
            if (options.type === 'GET' && segments.length === 1 && segments[0] === 'manifest') {
                return this.getManifest(options.headers);
            }
            if (options.type === 'GET' && segments.length === 3 && segments[0] === 'resource' && segments[2] === 'latest') {
                return this.getLatestData(segments[1], options.headers);
            }
            if (options.type === 'POST' && segments.length === 2 && segments[0] === 'resource') {
                return this.writeData(segments[1], options.data, options.headers);
            }
            if (options.type === 'DELETE' && segments.length === 1 && segments[0] === 'resource') {
                return this.clear(options.headers);
            }
            return this.toResponse(501);
        }
        async getManifest(headers) {
            if (this.session) {
                const latest = Object.create({});
                const manifest = { session: this.session, latest };
                this.data.forEach((value, key) => latest[key] = value.ref);
                return this.toResponse(200, { 'Content-Type': 'application/json' }, JSON.stringify(manifest));
            }
            return this.toResponse(204);
        }
        async getLatestData(resource, headers = {}) {
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = this.data.get(resourceKey);
                if (!data) {
                    return this.toResponse(204, { etag: '0' });
                }
                if (headers['If-None-Match'] === data.ref) {
                    return this.toResponse(304);
                }
                return this.toResponse(200, { etag: data.ref }, data.content || '');
            }
            return this.toResponse(204);
        }
        async writeData(resource, content = '', headers = {}) {
            if (!this.session) {
                this.session = (0, uuid_1.generateUuid)();
            }
            const resourceKey = ALL_SERVER_RESOURCES.find(key => key === resource);
            if (resourceKey) {
                const data = this.data.get(resourceKey);
                if (headers['If-Match'] !== undefined && headers['If-Match'] !== (data ? data.ref : '0')) {
                    return this.toResponse(412);
                }
                const ref = `${parseInt((data === null || data === void 0 ? void 0 : data.ref) || '0') + 1}`;
                this.data.set(resourceKey, { ref, content });
                return this.toResponse(200, { etag: ref });
            }
            return this.toResponse(204);
        }
        async clear(headers) {
            this.data.clear();
            this.session = null;
            return this.toResponse(204);
        }
        toResponse(statusCode, headers, data) {
            return {
                res: {
                    headers: headers || {},
                    statusCode
                },
                stream: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(data || ''))
            };
        }
    }
    exports.UserDataSyncTestServer = UserDataSyncTestServer;
    class TestUserDataSyncUtilService {
        async resolveDefaultIgnoredSettings() {
            return (0, userDataSync_1.getDefaultIgnoredSettings)();
        }
        async resolveUserBindings(userbindings) {
            const keys = {};
            for (const keybinding of userbindings) {
                keys[keybinding] = keybinding;
            }
            return keys;
        }
        async resolveFormattingOptions(file) {
            return { eol: '\n', insertSpaces: false, tabSize: 4 };
        }
    }
    exports.TestUserDataSyncUtilService = TestUserDataSyncUtilService;
});
//# sourceMappingURL=userDataSyncClient.js.map