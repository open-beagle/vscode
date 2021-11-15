/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "sinon", "assert", "fs", "vs/base/common/uuid", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/test/browser/extensionEnablementService.test", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/url/common/url", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/event", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/test/electron-browser/workbenchTestServices", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/services/progress/browser/progressService", "vs/platform/notification/common/notification", "vs/platform/url/common/urlService", "vs/base/common/uri", "vs/base/common/cancellation", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/electron-sandbox/remoteAgentServiceImpl", "vs/platform/ipc/electron-sandbox/services", "vs/workbench/test/common/workbenchTestServices", "vs/platform/product/common/productService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/experiments/common/experimentService", "vs/workbench/contrib/experiments/test/electron-browser/experimentService.test", "vs/platform/extensionManagement/electron-sandbox/extensionTipsService", "vs/base/common/network", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService"], function (require, exports, sinon, assert, fs, uuid_1, extensions_1, extensionsWorkbenchService_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensionEnablementService_test_1, extensionGalleryService_1, url_1, instantiationServiceMock_1, event_1, telemetry_1, telemetryUtils_1, workspace_1, workbenchTestServices_1, configuration_1, log_1, progress_1, progressService_1, notification_1, urlService_1, uri_1, cancellation_1, remoteAgentService_1, remoteAgentServiceImpl_1, services_1, workbenchTestServices_2, productService_1, lifecycle_1, workbenchTestServices_3, experimentService_1, experimentService_test_1, extensionTipsService_1, network_1, contextkey_1, mockKeybindingService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionsWorkbenchServiceTest', () => {
        let instantiationService;
        let testObject;
        let installEvent, didInstallEvent, uninstallEvent, didUninstallEvent;
        suiteSetup(() => {
            installEvent = new event_1.Emitter();
            didInstallEvent = new event_1.Emitter();
            uninstallEvent = new event_1.Emitter();
            didUninstallEvent = new event_1.Emitter();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(log_1.ILogService, log_1.NullLogService);
            instantiationService.stub(progress_1.IProgressService, progressService_1.ProgressService);
            instantiationService.stub(productService_1.IProductService, {});
            instantiationService.stub(extensionManagement_1.IExtensionGalleryService, extensionGalleryService_1.ExtensionGalleryService);
            instantiationService.stub(url_1.IURLService, urlService_1.NativeURLService);
            instantiationService.stub(services_1.ISharedProcessService, workbenchTestServices_1.TestSharedProcessService);
            instantiationService.stub(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_2.TestContextService());
            instantiationService.stub(configuration_1.IConfigurationService, {
                onDidChangeConfiguration: () => { return undefined; },
                getValue: (key) => {
                    return (key === extensions_1.AutoCheckUpdatesConfigurationKey || key === extensions_1.AutoUpdateConfigurationKey) ? true : undefined;
                }
            });
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, remoteAgentServiceImpl_1.RemoteAgentService);
            instantiationService.stub(extensionManagement_1.IExtensionManagementService, {
                onInstallExtension: installEvent.event,
                onDidInstallExtension: didInstallEvent.event,
                onUninstallExtension: uninstallEvent.event,
                onDidUninstallExtension: didUninstallEvent.event,
                async getInstalled() { return []; },
                async getExtensionsReport() { return []; },
                async updateMetadata(local, metadata) {
                    local.identifier.uuid = metadata.id;
                    local.publisherDisplayName = metadata.publisherDisplayName;
                    local.publisherId = metadata.publisherId;
                    return local;
                }
            });
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, {
                localExtensionManagementServer: {
                    extensionManagementService: instantiationService.get(extensionManagement_1.IExtensionManagementService)
                }
            });
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            instantiationService.stub(lifecycle_1.ILifecycleService, new workbenchTestServices_3.TestLifecycleService());
            instantiationService.stub(experimentService_1.IExperimentService, instantiationService.createInstance(experimentService_test_1.TestExperimentService));
            instantiationService.stub(extensionManagement_1.IExtensionTipsService, instantiationService.createInstance(extensionTipsService_1.ExtensionTipsService));
            instantiationService.stub(extensionRecommendations_1.IExtensionRecommendationsService, {});
            instantiationService.stub(notification_1.INotificationService, { prompt: () => null });
        });
        setup(async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', []);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage());
            instantiationService.stubPromise(notification_1.INotificationService, 'prompt', 0);
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).reset();
        });
        teardown(() => {
            testObject.dispose();
        });
        test('test gallery extension', async () => {
            const expected = aGalleryExtension('expectedName', {
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: 'expectedPublisher',
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1', 'pub.2'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                coreTranslations: []
            });
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(expected));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                assert.strictEqual(1, pagedResponse.firstPage.length);
                const actual = pagedResponse.firstPage[0];
                assert.strictEqual(1 /* User */, actual.type);
                assert.strictEqual('expectedName', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('expectedpublisher.expectedname', actual.identifier.id);
                assert.strictEqual('expectedPublisher', actual.publisher);
                assert.strictEqual('expectedPublisherDisplayName', actual.publisherDisplayName);
                assert.strictEqual('1.5.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(3 /* Uninstalled */, actual.state);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepEqual(['pub.1', 'pub.2'], actual.dependencies);
            });
        });
        test('test for empty installed extensions', async () => {
            testObject = await aWorkbenchService();
            assert.deepEqual([], testObject.local);
        });
        test('test for installed extensions', async () => {
            const expected1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const expected2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [expected1, expected2]);
            testObject = await aWorkbenchService();
            const actuals = testObject.local;
            assert.strictEqual(2, actuals.length);
            let actual = actuals[0];
            assert.strictEqual(1 /* User */, actual.type);
            assert.strictEqual('local1', actual.name);
            assert.strictEqual('localDisplayName1', actual.displayName);
            assert.strictEqual('localpublisher1.local1', actual.identifier.id);
            assert.strictEqual('localPublisher1', actual.publisher);
            assert.strictEqual('1.1.0', actual.version);
            assert.strictEqual('1.1.0', actual.latestVersion);
            assert.strictEqual('localDescription1', actual.description);
            assert.ok(actual.iconUrl === 'file:///localPath1/localIcon1' || actual.iconUrl === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.ok(actual.iconUrlFallback === 'file:///localPath1/localIcon1' || actual.iconUrlFallback === 'vscode-file://vscode-app/localPath1/localIcon1');
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepEqual(['pub.1', 'pub.2'], actual.dependencies);
            actual = actuals[1];
            assert.strictEqual(0 /* System */, actual.type);
            assert.strictEqual('local2', actual.name);
            assert.strictEqual('localDisplayName2', actual.displayName);
            assert.strictEqual('localpublisher2.local2', actual.identifier.id);
            assert.strictEqual('localPublisher2', actual.publisher);
            assert.strictEqual('1.2.0', actual.version);
            assert.strictEqual('1.2.0', actual.latestVersion);
            assert.strictEqual('localDescription2', actual.description);
            assert.ok(fs.existsSync(uri_1.URI.parse(actual.iconUrl).fsPath));
            assert.strictEqual(undefined, actual.licenseUrl);
            assert.strictEqual(1 /* Installed */, actual.state);
            assert.strictEqual(undefined, actual.installCount);
            assert.strictEqual(undefined, actual.rating);
            assert.strictEqual(undefined, actual.ratingCount);
            assert.strictEqual(false, actual.outdated);
            assert.deepEqual([], actual.dependencies);
        });
        test('test installed extensions get syncs with gallery', async () => {
            const local1 = aLocalExtension('local1', {
                publisher: 'localPublisher1',
                version: '1.1.0',
                displayName: 'localDisplayName1',
                description: 'localDescription1',
                icon: 'localIcon1',
                extensionDependencies: ['pub.1', 'pub.2'],
            }, {
                type: 1 /* User */,
                readmeUrl: 'localReadmeUrl1',
                changelogUrl: 'localChangelogUrl1',
                location: uri_1.URI.file('localPath1')
            });
            const local2 = aLocalExtension('local2', {
                publisher: 'localPublisher2',
                version: '1.2.0',
                displayName: 'localDisplayName2',
                description: 'localDescription2',
            }, {
                type: 0 /* System */,
                readmeUrl: 'localReadmeUrl2',
                changelogUrl: 'localChangelogUrl2',
            });
            const gallery1 = aGalleryExtension(local1.manifest.name, {
                identifier: local1.identifier,
                displayName: 'expectedDisplayName',
                version: '1.5.0',
                publisherId: 'expectedPublisherId',
                publisher: local1.manifest.publisher,
                publisherDisplayName: 'expectedPublisherDisplayName',
                description: 'expectedDescription',
                installCount: 1000,
                rating: 4,
                ratingCount: 100
            }, {
                dependencies: ['pub.1'],
            }, {
                manifest: { uri: 'uri:manifest', fallbackUri: 'fallback:manifest' },
                readme: { uri: 'uri:readme', fallbackUri: 'fallback:readme' },
                changelog: { uri: 'uri:changelog', fallbackUri: 'fallback:changlog' },
                download: { uri: 'uri:download', fallbackUri: 'fallback:download' },
                icon: { uri: 'uri:icon', fallbackUri: 'fallback:icon' },
                license: { uri: 'uri:license', fallbackUri: 'fallback:license' },
                repository: { uri: 'uri:repository', fallbackUri: 'fallback:repository' },
                coreTranslations: []
            });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local1, local2]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery1));
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            return eventToPromise(testObject.onChange).then(() => {
                const actuals = testObject.local;
                assert.strictEqual(2, actuals.length);
                let actual = actuals[0];
                assert.strictEqual(1 /* User */, actual.type);
                assert.strictEqual('local1', actual.name);
                assert.strictEqual('expectedDisplayName', actual.displayName);
                assert.strictEqual('localpublisher1.local1', actual.identifier.id);
                assert.strictEqual('localPublisher1', actual.publisher);
                assert.strictEqual('1.1.0', actual.version);
                assert.strictEqual('1.5.0', actual.latestVersion);
                assert.strictEqual('expectedDescription', actual.description);
                assert.strictEqual('uri:icon', actual.iconUrl);
                assert.strictEqual('fallback:icon', actual.iconUrlFallback);
                assert.strictEqual(1 /* Installed */, actual.state);
                assert.strictEqual('uri:license', actual.licenseUrl);
                assert.strictEqual(1000, actual.installCount);
                assert.strictEqual(4, actual.rating);
                assert.strictEqual(100, actual.ratingCount);
                assert.strictEqual(true, actual.outdated);
                assert.deepEqual(['pub.1'], actual.dependencies);
                actual = actuals[1];
                assert.strictEqual(0 /* System */, actual.type);
                assert.strictEqual('local2', actual.name);
                assert.strictEqual('localDisplayName2', actual.displayName);
                assert.strictEqual('localpublisher2.local2', actual.identifier.id);
                assert.strictEqual('localPublisher2', actual.publisher);
                assert.strictEqual('1.2.0', actual.version);
                assert.strictEqual('1.2.0', actual.latestVersion);
                assert.strictEqual('localDescription2', actual.description);
                assert.ok(fs.existsSync(uri_1.URI.parse(actual.iconUrl).fsPath));
                assert.strictEqual(undefined, actual.licenseUrl);
                assert.strictEqual(1 /* Installed */, actual.state);
                assert.strictEqual(undefined, actual.installCount);
                assert.strictEqual(undefined, actual.rating);
                assert.strictEqual(undefined, actual.ratingCount);
                assert.strictEqual(false, actual.outdated);
                assert.deepEqual([], actual.dependencies);
            });
        });
        test('test extension state computation', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* Uninstalled */, extension.state);
                testObject.install(extension);
                const identifier = gallery.identifier;
                // Installing
                installEvent.fire({ identifier, gallery });
                let local = testObject.local;
                assert.strictEqual(1, local.length);
                const actual = local[0];
                assert.strictEqual(`${gallery.publisher}.${gallery.name}`, actual.identifier.id);
                assert.strictEqual(0 /* Installing */, actual.state);
                // Installed
                didInstallEvent.fire({ identifier, gallery, operation: 1 /* Install */, local: aLocalExtension(gallery.name, gallery, { identifier }) });
                assert.strictEqual(1 /* Installed */, actual.state);
                assert.strictEqual(1, testObject.local.length);
                testObject.uninstall(actual);
                // Uninstalling
                uninstallEvent.fire(identifier);
                assert.strictEqual(2 /* Uninstalling */, actual.state);
                // Uninstalled
                didUninstallEvent.fire({ identifier });
                assert.strictEqual(3 /* Uninstalled */, actual.state);
                assert.strictEqual(0, testObject.local.length);
            });
        });
        test('test extension doesnot show outdated for system extensions', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier, version: '1.0.2' })));
            testObject = await aWorkbenchService();
            await testObject.queryLocal();
            assert.ok(!testObject.local[0].outdated);
        });
        test('test canInstall returns false for extensions with out gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            testObject.uninstall(target);
            uninstallEvent.fire(local.identifier);
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(!testObject.canInstall(target));
        });
        test('test canInstall returns false for a system extension', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            assert.ok(!testObject.canInstall(target));
        });
        test('test canInstall returns true for extensions with gallery', async () => {
            const local = aLocalExtension('a', { version: '1.0.1' }, { type: 1 /* User */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension(local.manifest.name, { identifier: local.identifier })));
            testObject = await aWorkbenchService();
            const target = testObject.local[0];
            return eventToPromise(testObject.onChange).then(() => {
                assert.ok(testObject.canInstall(target));
            });
        });
        test('test onchange event is triggered while installing', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const target = sinon.spy();
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* Uninstalled */, extension.state);
                testObject.install(extension);
                installEvent.fire({ identifier: gallery.identifier, gallery });
                testObject.onChange(target);
                // Installed
                didInstallEvent.fire({ identifier: gallery.identifier, gallery, operation: 1 /* Install */, local: aLocalExtension(gallery.name, gallery, gallery) });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered when installation is finished', async () => {
            const gallery = aGalleryExtension('gallery1');
            testObject = await aWorkbenchService();
            instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(gallery));
            const target = sinon.spy();
            return testObject.queryGallery(cancellation_1.CancellationToken.None).then(page => {
                const extension = page.firstPage[0];
                assert.strictEqual(3 /* Uninstalled */, extension.state);
                testObject.install(extension);
                testObject.onChange(target);
                // Installing
                installEvent.fire({ identifier: gallery.identifier, gallery });
                assert.ok(target.calledOnce);
            });
        });
        test('test onchange event is triggered while uninstalling', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            testObject.onChange(target);
            uninstallEvent.fire(local.identifier);
            assert.ok(target.calledOnce);
        });
        test('test onchange event is triggered when uninstalling is finished', async () => {
            const local = aLocalExtension('a', {}, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            testObject = await aWorkbenchService();
            const target = sinon.spy();
            testObject.uninstall(testObject.local[0]);
            uninstallEvent.fire(local.identifier);
            testObject.onChange(target);
            didUninstallEvent.fire({ identifier: local.identifier });
            assert.ok(target.calledOnce);
        });
        test('test uninstalled extensions are always enabled', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 5 /* DisabledWorkspace */))
                .then(async () => {
                testObject = await aWorkbenchService();
                instantiationService.stubPromise(extensionManagement_1.IExtensionGalleryService, 'query', aPage(aGalleryExtension('a')));
                return testObject.queryGallery(cancellation_1.CancellationToken.None).then(pagedResponse => {
                    const actual = pagedResponse.firstPage[0];
                    assert.strictEqual(actual.enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test enablement state installed enabled extension', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 6 /* EnabledGlobally */);
            });
        });
        test('test workspace disabled extension', async () => {
            const extensionA = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('d')], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 5 /* DisabledWorkspace */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('e')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 5 /* DisabledWorkspace */);
            });
        });
        test('test globally disabled extension', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('d')], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 4 /* DisabledGlobally */);
            });
        });
        test('test enablement state is updated for user extensions', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 5 /* DisabledWorkspace */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 5 /* DisabledWorkspace */);
                });
            });
        });
        test('test enable extension globally when extension is disabled for workspace', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 5 /* DisabledWorkspace */)
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test disable extension globally', async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 4 /* DisabledGlobally */);
            });
        });
        test('test system extensions can be disabled', async () => {
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a', {}, { type: 0 /* System */ })]);
            testObject = await aWorkbenchService();
            return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                .then(() => {
                const actual = testObject.local[0];
                assert.strictEqual(actual.enablementState, 4 /* DisabledGlobally */);
            });
        });
        test('test enablement state is updated on change from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 4 /* DisabledGlobally */)
                    .then(() => {
                    const actual = testObject.local[0];
                    assert.strictEqual(actual.enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable extension with dependencies disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test disable extension pack disables the pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable extension pack disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable extension fails if extension is a dependent of other', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 4 /* DisabledGlobally */).then(() => assert.fail('Should fail'), error => assert.ok(true));
            });
        });
        test('test disable extension disables all dependents when chosen to disable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    choices[0].run();
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                await testObject.setEnablement(testObject.local[1], 4 /* DisabledGlobally */);
                assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                assert.strictEqual(testObject.local[1].enablementState, 4 /* DisabledGlobally */);
            });
        });
        test('test disable extension when extension is part of a pack', async () => {
            const extensionA = aLocalExtension('a', { extensionPack: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[1], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[1].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test enable both dependency and dependent do not promot and do not fail', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 6 /* EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test disable extension does not fail if its dependency is a dependent of other but chosen to disable only itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependency is a dependent of other disabled extension', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */);
                });
            });
        });
        test('test disable extension if its dependencys dependency is itself', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.a'] });
            const extensionC = aLocalExtension('c');
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test disable extension if its dependency is dependent and is disabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.b'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => assert.strictEqual(testObject.local[0].enablementState, 4 /* DisabledGlobally */));
            });
        });
        test('test disable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            instantiationService.stub(notification_1.INotificationService, {
                prompt(severity, message, choices, options) {
                    options.onCancel();
                }
            });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 6 /* EnabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 6 /* EnabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => assert.fail('An extension with dependent should not be disabled'), () => null);
            });
        });
        test('test enable extension with dependencies enable all', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependencies does not prompt if dependency is enabled already', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 6 /* EnabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test enable extension with dependency does not prompt if both are enabled', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b');
            const extensionC = aLocalExtension('c');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                const target = sinon.spy();
                testObject = await aWorkbenchService();
                return testObject.setEnablement([testObject.local[1], testObject.local[0]], 6 /* EnabledGlobally */)
                    .then(() => {
                    assert.ok(!target.called);
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test enable extension with cyclic dependencies', async () => {
            const extensionA = aLocalExtension('a', { extensionDependencies: ['pub.b'] });
            const extensionB = aLocalExtension('b', { extensionDependencies: ['pub.c'] });
            const extensionC = aLocalExtension('c', { extensionDependencies: ['pub.a'] });
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionA], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionB], 4 /* DisabledGlobally */))
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([extensionC], 4 /* DisabledGlobally */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [extensionA, extensionB, extensionC]);
                testObject = await aWorkbenchService();
                return testObject.setEnablement(testObject.local[0], 6 /* EnabledGlobally */)
                    .then(() => {
                    assert.strictEqual(testObject.local[0].enablementState, 6 /* EnabledGlobally */);
                    assert.strictEqual(testObject.local[1].enablementState, 6 /* EnabledGlobally */);
                    assert.strictEqual(testObject.local[2].enablementState, 6 /* EnabledGlobally */);
                });
            });
        });
        test('test change event is fired when disablement flags are changed', async () => {
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [aLocalExtension('a')]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                testObject.onChange(target);
                return testObject.setEnablement(testObject.local[0], 4 /* DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test change event is fired when disablement flags are changed from outside', async () => {
            const localExtension = aLocalExtension('a');
            return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('c')], 4 /* DisabledGlobally */)
                .then(() => instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([aLocalExtension('b')], 5 /* DisabledWorkspace */))
                .then(async () => {
                instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [localExtension]);
                testObject = await aWorkbenchService();
                const target = sinon.spy();
                testObject.onChange(target);
                return instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 4 /* DisabledGlobally */)
                    .then(() => assert.ok(target.calledOnce));
            });
        });
        test('test updating an extension does not re-eanbles it when disabled globally', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 4 /* DisabledGlobally */);
            didInstallEvent.fire({ local, identifier: local.identifier, operation: 2 /* Update */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 4 /* DisabledGlobally */);
        });
        test('test updating an extension does not re-eanbles it when workspace disabled', async () => {
            testObject = await aWorkbenchService();
            const local = aLocalExtension('pub.a');
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([local], 5 /* DisabledWorkspace */);
            didInstallEvent.fire({ local, identifier: local.identifier, operation: 2 /* Update */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [local]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual[0].enablementState, 5 /* DisabledWorkspace */);
        });
        test('test user extension is preferred when the same extension exists as system and user extension', async () => {
            testObject = await aWorkbenchService();
            const userExtension = aLocalExtension('pub.a');
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* System */ });
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
        });
        test('test user extension is disabled when the same extension exists as system and user extension and system extension is disabled', async () => {
            testObject = await aWorkbenchService();
            const systemExtension = aLocalExtension('pub.a', {}, { type: 0 /* System */ });
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([systemExtension], 4 /* DisabledGlobally */);
            const userExtension = aLocalExtension('pub.a');
            instantiationService.stubPromise(extensionManagement_1.IExtensionManagementService, 'getInstalled', [systemExtension, userExtension]);
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, userExtension);
            assert.strictEqual(actual[0].enablementState, 4 /* DisabledGlobally */);
        });
        test('Test local ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,web,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['ui', 'web', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,ui,workspace extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local web,workspace,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['web', 'workspace', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,web,ui extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'web', 'ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local workspace,ui,web extension is chosen if it exists only in local server', async () => {
            // multi server setup
            const extensionKind = ['workspace', 'ui', 'web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local UI extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test local ui,workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote workspace extension is chosen if it exists in remote server', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService(), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 4 /* DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 4 /* DisabledGlobally */);
        });
        test('Test remote workspace extension is chosen if it exists in both servers and remote is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([remoteExtension], 5 /* DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
            assert.strictEqual(actual[0].enablementState, 5 /* DisabledWorkspace */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 4 /* DisabledGlobally */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 4 /* DisabledGlobally */);
        });
        test('Test local ui, workspace extension is chosen if it exists in both servers and local is disabled in workspace', async () => {
            // multi server setup
            const extensionKind = ['ui', 'workspace'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            await instantiationService.get(extensionManagement_2.IWorkbenchExtensionEnablementService).setEnablement([localExtension], 5 /* DisabledWorkspace */);
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
            assert.strictEqual(actual[0].enablementState, 5 /* DisabledWorkspace */);
        });
        test('Test local web extension is chosen if it exists in both servers', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const localExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`) });
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([localExtension]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, localExtension);
        });
        test('Test remote web extension is chosen if it exists only in remote', async () => {
            // multi server setup
            const extensionKind = ['web'];
            const remoteExtension = aLocalExtension('a', { extensionKind }, { location: uri_1.URI.file(`pub.a`).with({ scheme: network_1.Schemas.vscodeRemote }) });
            const extensionManagementServerService = aMultiExtensionManagementServerService(instantiationService, createExtensionManagementService([]), createExtensionManagementService([remoteExtension]));
            instantiationService.stub(extensionManagement_2.IExtensionManagementServerService, extensionManagementServerService);
            instantiationService.stub(extensionManagement_2.IWorkbenchExtensionEnablementService, new extensionEnablementService_test_1.TestExtensionEnablementService(instantiationService));
            testObject = await aWorkbenchService();
            const actual = await testObject.queryLocal();
            assert.strictEqual(actual.length, 1);
            assert.strictEqual(actual[0].local, remoteExtension);
        });
        async function aWorkbenchService() {
            const workbenchService = instantiationService.createInstance(extensionsWorkbenchService_1.ExtensionsWorkbenchService);
            await workbenchService.queryLocal();
            return workbenchService;
        }
        function aLocalExtension(name = 'someext', manifest = {}, properties = {}) {
            manifest = Object.assign({ name, publisher: 'pub', version: '1.0.0' }, manifest);
            properties = Object.assign({ type: 1 /* User */, location: uri_1.URI.file(`pub.${name}`), identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) } }, properties);
            return Object.create(Object.assign({ manifest }, properties));
        }
        const noAssets = {
            changelog: null,
            download: null,
            icon: null,
            license: null,
            manifest: null,
            readme: null,
            repository: null,
            coreTranslations: []
        };
        function aGalleryExtension(name, properties = {}, galleryExtensionProperties = {}, assets = noAssets) {
            const galleryExtension = Object.create(Object.assign({ name, publisher: 'pub', version: '1.0.0', properties: {}, assets: {} }, properties));
            galleryExtension.properties = Object.assign(Object.assign(Object.assign({}, galleryExtension.properties), { dependencies: [] }), galleryExtensionProperties);
            galleryExtension.assets = Object.assign(Object.assign({}, galleryExtension.assets), assets);
            galleryExtension.identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(galleryExtension.publisher, galleryExtension.name), uuid: (0, uuid_1.generateUuid)() };
            return galleryExtension;
        }
        function aPage(...objects) {
            return { firstPage: objects, total: objects.length, pageSize: objects.length, getPage: () => null };
        }
        function eventToPromise(event, count = 1) {
            return new Promise(c => {
                let counter = 0;
                event(() => {
                    if (++counter === count) {
                        c(undefined);
                    }
                });
            });
        }
        function aMultiExtensionManagementServerService(instantiationService, localExtensionManagementService, remoteExtensionManagementService) {
            const localExtensionManagementServer = {
                id: 'vscode-local',
                label: 'local',
                extensionManagementService: localExtensionManagementService || createExtensionManagementService()
            };
            const remoteExtensionManagementServer = {
                id: 'vscode-remote',
                label: 'remote',
                extensionManagementService: remoteExtensionManagementService || createExtensionManagementService()
            };
            return {
                _serviceBrand: undefined,
                localExtensionManagementServer,
                remoteExtensionManagementServer,
                webExtensionManagementServer: null,
                getExtensionManagementServer: (extension) => {
                    if (extension.location.scheme === network_1.Schemas.file) {
                        return localExtensionManagementServer;
                    }
                    if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                        return remoteExtensionManagementServer;
                    }
                    throw new Error('');
                }
            };
        }
        function createExtensionManagementService(installed = []) {
            return {
                onInstallExtension: event_1.Event.None,
                onDidInstallExtension: event_1.Event.None,
                onUninstallExtension: event_1.Event.None,
                onDidUninstallExtension: event_1.Event.None,
                getInstalled: () => Promise.resolve(installed),
                installFromGallery: (extension) => Promise.reject(new Error('not supported')),
                updateMetadata: async (local, metadata) => {
                    local.identifier.uuid = metadata.id;
                    local.publisherDisplayName = metadata.publisherDisplayName;
                    local.publisherId = metadata.publisherId;
                    return local;
                }
            };
        }
    });
});
//# sourceMappingURL=extensionsWorkbenchService.test.js.map