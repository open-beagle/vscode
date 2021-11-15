define(["require", "exports", "assert", "sinon", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/browser/extensionEnablementService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/workspace/common/workspace", "vs/workbench/services/environment/common/environmentService", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/configuration/common/configuration", "vs/base/common/uri", "vs/base/common/network", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/services/host/browser/host", "vs/base/test/common/mock", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/workspaces/test/common/testWorkspaceTrustService", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/workspace/test/common/testWorkspace"], function (require, exports, assert, sinon, extensionManagement_1, extensionManagement_2, extensionEnablementService_1, instantiationServiceMock_1, event_1, workspace_1, environmentService_1, storage_1, types_1, extensionManagementUtil_1, configuration_1, uri_1, network_1, testConfigurationService_1, workbenchTestServices_1, extensionEnablementService_2, userDataSyncAccount_1, userDataSync_1, lifecycle_1, notification_1, testNotificationService_1, host_1, mock_1, workspaceTrust_1, testWorkspaceTrustService_1, extensionManifestPropertiesService_1, workbenchTestServices_2, testWorkspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestExtensionEnablementService = void 0;
    function createStorageService(instantiationService) {
        let service = instantiationService.get(storage_1.IStorageService);
        if (!service) {
            let workspaceContextService = instantiationService.get(workspace_1.IWorkspaceContextService);
            if (!workspaceContextService) {
                workspaceContextService = instantiationService.stub(workspace_1.IWorkspaceContextService, {
                    getWorkbenchState: () => 2 /* FOLDER */,
                    getWorkspace: () => testWorkspace_1.TestWorkspace
                });
            }
            service = instantiationService.stub(storage_1.IStorageService, new storage_1.InMemoryStorageService());
        }
        return service;
    }
    class TestExtensionEnablementService extends extensionEnablementService_1.ExtensionEnablementService {
        constructor(instantiationService) {
            const storageService = createStorageService(instantiationService);
            const extensionManagementService = instantiationService.get(extensionManagement_1.IExtensionManagementService) || instantiationService.stub(extensionManagement_1.IExtensionManagementService, { onDidInstallExtension: new event_1.Emitter().event, onDidUninstallExtension: new event_1.Emitter().event });
            const extensionManagementServerService = instantiationService.get(extensionManagement_2.IExtensionManagementServerService) || instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, { localExtensionManagementServer: { extensionManagementService } });
            super(storageService, new extensionEnablementService_2.GlobalExtensionEnablementService(storageService), instantiationService.get(workspace_1.IWorkspaceContextService) || new workbenchTestServices_2.TestContextService(), instantiationService.get(environmentService_1.IWorkbenchEnvironmentService) || instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { configuration: Object.create(null) }), extensionManagementService, instantiationService.get(configuration_1.IConfigurationService), extensionManagementServerService, instantiationService.get(userDataSync_1.IUserDataAutoSyncEnablementService) || instantiationService.stub(userDataSync_1.IUserDataAutoSyncEnablementService, { isEnabled() { return false; } }), instantiationService.get(userDataSyncAccount_1.IUserDataSyncAccountService) || instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, userDataSyncAccount_1.UserDataSyncAccountService), instantiationService.get(lifecycle_1.ILifecycleService) || instantiationService.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_1.TestLifecycleService()), instantiationService.get(notification_1.INotificationService) || instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService()), instantiationService.get(host_1.IHostService), new class extends (0, mock_1.mock)() {
                isDisabledByBisect() { return false; }
            }, instantiationService.get(workspaceTrust_1.IWorkspaceTrustManagementService) || instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, new testWorkspaceTrustService_1.TestWorkspaceTrustManagementService()), new class extends (0, mock_1.mock)() {
                requestWorkspaceTrust(options) { return Promise.resolve(true); }
            }, instantiationService.get(extensionManifestPropertiesService_1.IExtensionManifestPropertiesService) || instantiationService.stub(extensionManifestPropertiesService_1.IExtensionManifestPropertiesService, new extensionManifestPropertiesService_1.ExtensionManifestPropertiesService(workbenchTestServices_2.TestProductService, new testConfigurationService_1.TestConfigurationService())));
        }
        reset() {
            let extensions = this.globalExtensionEnablementService.getDisabledExtensions();
            for (const e of this._getWorkspaceDisabledExtensions()) {
                if (!extensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)(r, e))) {
                    extensions.push(e);
                }
            }
            const workspaceEnabledExtensions = this._getWorkspaceEnabledExtensions();
            if (workspaceEnabledExtensions.length) {
                extensions = extensions.filter(r => !workspaceEnabledExtensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, r)));
            }
            extensions.forEach(d => this.setEnablement([aLocalExtension(d.id)], 6 /* EnabledGlobally */));
        }
    }
    exports.TestExtensionEnablementService = TestExtensionEnablementService;
    suite('ExtensionEnablementService Test', () => {
        let instantiationService;
        let testObject;
        const didInstallEvent = new event_1.Emitter();
        const didUninstallEvent = new event_1.Emitter();
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                onDidInstallExtension: didInstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                getInstalled: () => Promise.resolve([])
            });
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, {
                localExtensionManagementServer: {
                    extensionManagementService: instantiationService.get(extensionManagement_1.IExtensionManagementService)
                }
            });
            testObject = new TestExtensionEnablementService(instantiationService);
        });
        teardown(() => {
            testObject.dispose();
        });
        test('test disable an extension globally', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            assert.ok(!testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 4 /* DisabledGlobally */);
        });
        test('test disable an extension globally should return truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(value => assert.ok(value));
        });
        test('test disable an extension globally triggers the change event', () => {
            const target = sinon.spy();
            testObject.onEnablementChanged(target);
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual(target.args[0][0][0].identifier, { id: 'pub.a' });
            });
        });
        test('test disable an extension globally again should return a falsy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */))
                .then(value => assert.ok(!value[0]));
        });
        test('test state of globally disabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 4 /* DisabledGlobally */));
        });
        test('test state of globally enabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 6 /* EnabledGlobally */));
        });
        test('test disable an extension for workspace', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            assert.ok(!testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 5 /* DisabledWorkspace */);
        });
        test('test disable an extension for workspace returns a truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(value => assert.ok(value));
        });
        test('test disable an extension for workspace again should return a falsy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(value => assert.ok(!value[0]));
        });
        test('test state of workspace disabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 5 /* DisabledWorkspace */));
        });
        test('test state of workspace and globally disabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 5 /* DisabledWorkspace */));
        });
        test('test state of workspace enabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 7 /* EnabledWorkspace */));
        });
        test('test state of globally disabled and workspace enabled extension', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 7 /* EnabledWorkspace */));
        });
        test('test state of an extension when disabled for workspace from workspace enabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 5 /* DisabledWorkspace */));
        });
        test('test state of an extension when disabled globally from workspace enabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 4 /* DisabledGlobally */));
        });
        test('test state of an extension when disabled globally from workspace disabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 4 /* DisabledGlobally */));
        });
        test('test state of an extension when enabled globally from workspace enabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 6 /* EnabledGlobally */));
        });
        test('test state of an extension when enabled globally from workspace disabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */))
                .then(() => assert.strictEqual(testObject.getEnablementState(aLocalExtension('pub.a')), 6 /* EnabledGlobally */));
        });
        test('test disable an extension for workspace and then globally', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            assert.ok(!testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 4 /* DisabledGlobally */);
        });
        test('test disable an extension for workspace and then globally return a truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */))
                .then(value => assert.ok(value));
        });
        test('test disable an extension for workspace and then globally trigger the change event', () => {
            const target = sinon.spy();
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.onEnablementChanged(target))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */))
                .then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual(target.args[0][0][0].identifier, { id: 'pub.a' });
            });
        });
        test('test disable an extension globally and then for workspace', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            assert.ok(!testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 5 /* DisabledWorkspace */);
        });
        test('test disable an extension globally and then for workspace return a truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(value => assert.ok(value));
        });
        test('test disable an extension globally and then for workspace triggers the change event', () => {
            const target = sinon.spy();
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.onEnablementChanged(target))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */))
                .then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual(target.args[0][0][0].identifier, { id: 'pub.a' });
            });
        });
        test('test disable an extension for workspace when there is no workspace throws error', () => {
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkbenchState', 1 /* EMPTY */);
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => assert.fail('should throw an error'), error => assert.ok(error));
        });
        test('test enable an extension globally', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            await testObject.setEnablement([extension], 6 /* EnabledGlobally */);
            assert.ok(testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test enable an extension globally return truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */))
                .then(value => assert.ok(value));
        });
        test('test enable an extension globally triggers change event', () => {
            const target = sinon.spy();
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => testObject.onEnablementChanged(target))
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */))
                .then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual(target.args[0][0][0].identifier, { id: 'pub.a' });
            });
        });
        test('test enable an extension globally when already enabled return falsy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 6 /* EnabledGlobally */)
                .then(value => assert.ok(!value[0]));
        });
        test('test enable an extension for workspace', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            await testObject.setEnablement([extension], 7 /* EnabledWorkspace */);
            assert.ok(testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 7 /* EnabledWorkspace */);
        });
        test('test enable an extension for workspace return truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */))
                .then(value => assert.ok(value));
        });
        test('test enable an extension for workspace triggers change event', () => {
            const target = sinon.spy();
            return testObject.setEnablement([aLocalExtension('pub.b')], 5 /* DisabledWorkspace */)
                .then(() => testObject.onEnablementChanged(target))
                .then(() => testObject.setEnablement([aLocalExtension('pub.b')], 7 /* EnabledWorkspace */))
                .then(() => {
                assert.ok(target.calledOnce);
                assert.deepStrictEqual(target.args[0][0][0].identifier, { id: 'pub.b' });
            });
        });
        test('test enable an extension for workspace when already enabled return truthy promise', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 7 /* EnabledWorkspace */)
                .then(value => assert.ok(value));
        });
        test('test enable an extension for workspace when disabled in workspace and gloablly', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            await testObject.setEnablement([extension], 7 /* EnabledWorkspace */);
            assert.ok(testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 7 /* EnabledWorkspace */);
        });
        test('test enable an extension globally when disabled in workspace and gloablly', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 7 /* EnabledWorkspace */);
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            await testObject.setEnablement([extension], 6 /* EnabledGlobally */);
            assert.ok(testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test remove an extension from disablement list when uninstalled', async () => {
            const extension = aLocalExtension('pub.a');
            await testObject.setEnablement([extension], 5 /* DisabledWorkspace */);
            await testObject.setEnablement([extension], 4 /* DisabledGlobally */);
            didUninstallEvent.fire({ identifier: { id: 'pub.a' } });
            assert.ok(testObject.isEnabled(extension));
            assert.strictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test isEnabled return false extension is disabled globally', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 4 /* DisabledGlobally */)
                .then(() => assert.ok(!testObject.isEnabled(aLocalExtension('pub.a'))));
        });
        test('test isEnabled return false extension is disabled in workspace', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => assert.ok(!testObject.isEnabled(aLocalExtension('pub.a'))));
        });
        test('test isEnabled return true extension is not disabled', () => {
            return testObject.setEnablement([aLocalExtension('pub.a')], 5 /* DisabledWorkspace */)
                .then(() => testObject.setEnablement([aLocalExtension('pub.c')], 4 /* DisabledGlobally */))
                .then(() => assert.ok(testObject.isEnabled(aLocalExtension('pub.b'))));
        });
        test('test canChangeEnablement return false for language packs', () => {
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a', { localizations: [{ languageId: 'gr', translations: [{ id: 'vscode', path: 'path' }] }] })), false);
        });
        test('test canChangeEnablement return true for auth extension', () => {
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a', { authentication: [{ id: 'a', label: 'a' }] })), true);
        });
        test('test canChangeEnablement return true for auth extension when user data sync account does not depends on it', () => {
            instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, {
                account: { authenticationProviderId: 'b' }
            });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a', { authentication: [{ id: 'a', label: 'a' }] })), true);
        });
        test('test canChangeEnablement return true for auth extension when user data sync account depends on it but auto sync is off', () => {
            instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, {
                account: { authenticationProviderId: 'a' }
            });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a', { authentication: [{ id: 'a', label: 'a' }] })), true);
        });
        test('test canChangeEnablement return false for auth extension and user data sync account depends on it and auto sync is on', () => {
            instantiationService.stub(userDataSync_1.IUserDataAutoSyncEnablementService, { isEnabled() { return true; } });
            instantiationService.stub(userDataSyncAccount_1.IUserDataSyncAccountService, {
                account: { authenticationProviderId: 'a' }
            });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a', { authentication: [{ id: 'a', label: 'a' }] })), false);
        });
        test('test canChangeWorkspaceEnablement return true', () => {
            assert.strictEqual(testObject.canChangeWorkspaceEnablement(aLocalExtension('pub.a')), true);
        });
        test('test canChangeWorkspaceEnablement return false if there is no workspace', () => {
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkbenchState', 1 /* EMPTY */);
            assert.strictEqual(testObject.canChangeWorkspaceEnablement(aLocalExtension('pub.a')), false);
        });
        test('test canChangeWorkspaceEnablement return false for auth extension', () => {
            assert.strictEqual(testObject.canChangeWorkspaceEnablement(aLocalExtension('pub.a', { authentication: [{ id: 'a', label: 'a' }] })), false);
        });
        test('test canChangeEnablement return false when extensions are disabled in environment', () => {
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { disableExtensions: true });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a')), false);
        });
        test('test canChangeEnablement return false when the extension is disabled in environment', () => {
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { disableExtensions: ['pub.a'] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(aLocalExtension('pub.a')), false);
        });
        test('test canChangeEnablement return true for system extensions when extensions are disabled in environment', () => {
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { disableExtensions: true });
            testObject = new TestExtensionEnablementService(instantiationService);
            const extension = aLocalExtension('pub.a', undefined, 0 /* System */);
            assert.strictEqual(testObject.canChangeEnablement(extension), true);
        });
        test('test canChangeEnablement return false for system extension when extension is disabled in environment', () => {
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { disableExtensions: ['pub.a'] });
            testObject = new TestExtensionEnablementService(instantiationService);
            const extension = aLocalExtension('pub.a', undefined, 0 /* System */);
            assert.ok(!testObject.canChangeEnablement(extension));
        });
        test('test extension is disabled when disabled in environment', async () => {
            const extension = aLocalExtension('pub.a');
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, { disableExtensions: ['pub.a'] });
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                onDidInstallExtension: didInstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                getInstalled: () => Promise.resolve([extension, aLocalExtension('pub.b')])
            });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.isEnabled(extension));
            assert.deepStrictEqual(testObject.getEnablementState(extension), 2 /* DisabledByEnvironment */);
        });
        test('test extension does not support vitrual workspace is not enabled in virtual workspace', async () => {
            const extension = aLocalExtension2('pub.a', { capabilities: { virtualWorkspaces: false } });
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkspace', { folders: [{ uri: uri_1.URI.file('worskapceA').with(({ scheme: 'virtual' })) }] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.isEnabled(extension));
            assert.deepStrictEqual(testObject.getEnablementState(extension), 3 /* DisabledByVirtualWorkspace */);
        });
        test('test canChangeEnablement return false when extension is disabled in virtual workspace', () => {
            const extension = aLocalExtension2('pub.a', { capabilities: { virtualWorkspaces: false } });
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkspace', { folders: [{ uri: uri_1.URI.file('worskapceA').with(({ scheme: 'virtual' })) }] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.canChangeEnablement(extension));
        });
        test('test extension does not support vitrual workspace is enabled in virtual workspace', async () => {
            const extension = aLocalExtension2('pub.a', { capabilities: { virtualWorkspaces: false } });
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkspace', { folders: [{ uri: uri_1.URI.file('worskapceA') }] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(extension));
            assert.deepStrictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test extension supports virtual workspace is enabled in virtual workspace', async () => {
            const extension = aLocalExtension2('pub.a', { capabilities: { virtualWorkspaces: true } });
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkspace', { folders: [{ uri: uri_1.URI.file('worskapceA').with(({ scheme: 'virtual' })) }] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(extension));
            assert.deepStrictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test extension without any value for virtual worksapce is enabled in virtual workspace', async () => {
            const extension = aLocalExtension2('pub.a');
            instantiationService.stub(workspace_1.IWorkspaceContextService, 'getWorkspace', { folders: [{ uri: uri_1.URI.file('worskapceA').with(({ scheme: 'virtual' })) }] });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(extension));
            assert.deepStrictEqual(testObject.getEnablementState(extension), 6 /* EnabledGlobally */);
        });
        test('test local workspace extension is disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test local workspace + ui extension is enabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['workspace', 'ui'] }, { location: uri_1.URI.file(`pub.a`) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 6 /* EnabledGlobally */);
        });
        test('test local ui extension is not disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 6 /* EnabledGlobally */);
        });
        test('test canChangeEnablement return false when the local workspace extension is disabled by kind', () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(localWorkspaceExtension), false);
        });
        test('test canChangeEnablement return true for local ui extension', () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(localWorkspaceExtension), true);
        });
        test('test remote ui extension is disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test remote ui+workspace extension is disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui', 'workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 6 /* EnabledGlobally */);
        });
        test('test remote ui extension is disabled by kind when there is no local server', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, anExtensionManagementServerService(null, anExtensionManagementServer('vscode-remote', instantiationService), null));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(!testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test remote workspace extension is not disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.ok(testObject.isEnabled(localWorkspaceExtension));
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 6 /* EnabledGlobally */);
        });
        test('test canChangeEnablement return false when the remote ui extension is disabled by kind', () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['ui'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(localWorkspaceExtension), false);
        });
        test('test canChangeEnablement return true for remote workspace extension', () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['workspace'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.canChangeEnablement(localWorkspaceExtension), true);
        });
        test('test web extension on local server is disabled by kind when web worker is not enabled', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['web'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.get(configuration_1.IConfigurationService).setUserConfiguration('extensions', { webWorker: false });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.isEnabled(localWorkspaceExtension), false);
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test web extension on local server is not disabled by kind when web worker is enabled', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, aMultiExtensionManagementServerService(instantiationService));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['web'] }, { location: uri_1.URI.file(`pub.a`) });
            instantiationService.get(configuration_1.IConfigurationService).setUserConfiguration('extensions', { webWorker: true });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.isEnabled(localWorkspaceExtension), true);
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 6 /* EnabledGlobally */);
        });
        test('test web extension on remote server is disabled by kind when web worker is not enabled', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, anExtensionManagementServerService(anExtensionManagementServer('vscode-local', instantiationService), anExtensionManagementServer('vscode-remote', instantiationService), anExtensionManagementServer('web', instantiationService)));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['web'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: 'vscode-remote' }) });
            instantiationService.get(configuration_1.IConfigurationService).setUserConfiguration('extensions', { webWorker: false });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.isEnabled(localWorkspaceExtension), false);
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test web extension on remote server is disabled by kind when web worker is enabled', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, anExtensionManagementServerService(anExtensionManagementServer('vscode-local', instantiationService), anExtensionManagementServer('vscode-remote', instantiationService), anExtensionManagementServer('web', instantiationService)));
            const localWorkspaceExtension = aLocalExtension2('pub.a', { extensionKind: ['web'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: 'vscode-remote' }) });
            instantiationService.get(configuration_1.IConfigurationService).setUserConfiguration('extensions', { webWorker: true });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.isEnabled(localWorkspaceExtension), false);
            assert.deepStrictEqual(testObject.getEnablementState(localWorkspaceExtension), 1 /* DisabledByExtensionKind */);
        });
        test('test web extension on web server is not disabled by kind', async () => {
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, anExtensionManagementServerService(anExtensionManagementServer('vscode-local', instantiationService), anExtensionManagementServer('vscode-remote', instantiationService), anExtensionManagementServer('web', instantiationService)));
            const webExtension = aLocalExtension2('pub.a', { extensionKind: ['web'] }, { location: uri_1.URI.file(`pub.a`).with({ scheme: 'web' }) });
            testObject = new TestExtensionEnablementService(instantiationService);
            assert.strictEqual(testObject.isEnabled(webExtension), true);
            assert.deepStrictEqual(testObject.getEnablementState(webExtension), 6 /* EnabledGlobally */);
        });
    });
    function anExtensionManagementServer(authority, instantiationService) {
        return {
            id: authority,
            label: authority,
            extensionManagementService: instantiationService.get(extensionManagement_1.IExtensionManagementService)
        };
    }
    function aMultiExtensionManagementServerService(instantiationService) {
        const localExtensionManagementServer = anExtensionManagementServer('vscode-local', instantiationService);
        const remoteExtensionManagementServer = anExtensionManagementServer('vscode-remote', instantiationService);
        return anExtensionManagementServerService(localExtensionManagementServer, remoteExtensionManagementServer, null);
    }
    function anExtensionManagementServerService(localExtensionManagementServer, remoteExtensionManagementServer, webExtensionManagementServer) {
        return {
            _serviceBrand: undefined,
            localExtensionManagementServer,
            remoteExtensionManagementServer,
            webExtensionManagementServer,
            getExtensionManagementServer: (extension) => {
                if (extension.location.scheme === network_1.Schemas.file) {
                    return localExtensionManagementServer;
                }
                if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                    return remoteExtensionManagementServer;
                }
                return webExtensionManagementServer;
            }
        };
    }
    function aLocalExtension(id, contributes, type) {
        return aLocalExtension2(id, contributes ? { contributes } : {}, (0, types_1.isUndefinedOrNull)(type) ? {} : { type });
    }
    function aLocalExtension2(id, manifest = {}, properties = {}) {
        const [publisher, name] = id.split('.');
        manifest = Object.assign({ name, publisher }, manifest);
        properties = Object.assign({ identifier: { id }, galleryIdentifier: { id, uuid: undefined }, type: 1 /* User */ }, properties);
        properties.isBuiltin = properties.type === 0 /* System */;
        return Object.create(Object.assign({ manifest }, properties));
    }
});
//# sourceMappingURL=extensionEnablementService.test.js.map