/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService", "vs/base/common/platform"], function (require, exports, assert, extensionManifestPropertiesService_1, testConfigurationService_1, workbenchTestServices_1, instantiationServiceMock_1, configuration_1, productService_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtensionManifestPropertiesService - ExtensionKind', () => {
        function check(manifest, expected) {
            const extensionManifestPropertiesService = new extensionManifestPropertiesService_1.ExtensionManifestPropertiesService(workbenchTestServices_1.TestProductService, new testConfigurationService_1.TestConfigurationService());
            assert.deepStrictEqual(extensionManifestPropertiesService.deduceExtensionKind(manifest), expected);
        }
        test('declarative with extension dependencies => workspace', () => {
            check({ extensionDependencies: ['ext1'] }, ['workspace']);
        });
        test('declarative extension pack => workspace', () => {
            check({ extensionPack: ['ext1', 'ext2'] }, ['workspace']);
        });
        test('declarative with unknown contribution point => workspace', () => {
            check({ contributes: { 'unknownPoint': { something: true } } }, ['workspace']);
        });
        test('simple declarative => ui, workspace, web', () => {
            check({}, ['ui', 'workspace', 'web']);
        });
        test('only browser => web', () => {
            check({ browser: 'main.browser.js' }, ['web']);
        });
        test('only main => workspace', () => {
            check({ main: 'main.js' }, ['workspace']);
        });
        test('main and browser => workspace, web', () => {
            check({ main: 'main.js', browser: 'main.browser.js' }, ['workspace', 'web']);
        });
    });
    // Workspace Trust is disabled in web at the moment
    if (!platform_1.isWeb) {
        suite('ExtensionManifestPropertiesService - ExtensionUntrustedWorkpaceSupportType', () => {
            let testObject;
            let instantiationService;
            let testConfigurationService;
            setup(async () => {
                instantiationService = new instantiationServiceMock_1.TestInstantiationService();
                testConfigurationService = new testConfigurationService_1.TestConfigurationService();
                instantiationService.stub(configuration_1.IConfigurationService, testConfigurationService);
                await testConfigurationService.setUserConfiguration('security', { workspace: { trust: { enabled: true } } });
            });
            teardown(() => testObject.dispose());
            function assertUntrustedWorkspaceSupport(extensionMaifest, expected) {
                testObject = instantiationService.createInstance(extensionManifestPropertiesService_1.ExtensionManifestPropertiesService);
                const untrustedWorkspaceSupport = testObject.getExtensionUntrustedWorkspaceSupportType(extensionMaifest);
                assert.strictEqual(untrustedWorkspaceSupport, expected);
            }
            function getExtensionManifest(properties = {}) {
                return Object.create(Object.assign({ name: 'a', publisher: 'pub', version: '1.0.0' }, properties));
            }
            test('test extension workspace trust request when main entry point is missing', () => {
                instantiationService.stub(productService_1.IProductService, {});
                const extensionMaifest = getExtensionManifest();
                assertUntrustedWorkspaceSupport(extensionMaifest, true);
            });
            test('test extension workspace trust request when workspace trust is disabled', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                await testConfigurationService.setUserConfiguration('security', { workspace: { trust: { enabled: false } } });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionMaifest, true);
            });
            test('test extension workspace trust request when override exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                await testConfigurationService.setUserConfiguration('security', { workspace: { trust: { extensionUntrustedSupport: { 'pub.a': { supported: true } } } } });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionMaifest, true);
            });
            test('test extension workspace trust request when override for the version exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                await testConfigurationService.setUserConfiguration('security', { workspace: { trust: { extensionUntrustedSupport: { 'pub.a': { supported: true, version: '1.0.0' } } } } });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionMaifest, true);
            });
            test('test extension workspace trust request when override for a different version exists in settings.json', async () => {
                instantiationService.stub(productService_1.IProductService, {});
                await testConfigurationService.setUserConfiguration('security', {
                    workspace: {
                        trust: {
                            enabled: true,
                            extensionUntrustedSupport: { 'pub.a': { supported: true, version: '2.0.0' } }
                        }
                    }
                });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionMaifest, 'limited');
            });
            test('test extension workspace trust request when default exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { default: true } } });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionMaifest, true);
            });
            test('test extension workspace trust request when override exists in product.json', () => {
                instantiationService.stub(productService_1.IProductService, { extensionUntrustedWorkspaceSupport: { 'pub.a': { override: 'limited' } } });
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: true } } });
                assertUntrustedWorkspaceSupport(extensionMaifest, 'limited');
            });
            test('test extension workspace trust request when value exists in package.json', () => {
                instantiationService.stub(productService_1.IProductService, {});
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js', capabilities: { untrustedWorkspaces: { supported: 'limited' } } });
                assertUntrustedWorkspaceSupport(extensionMaifest, 'limited');
            });
            test('test extension workspace trust request when no value exists in package.json', () => {
                instantiationService.stub(productService_1.IProductService, {});
                const extensionMaifest = getExtensionManifest({ main: './out/extension.js' });
                assertUntrustedWorkspaceSupport(extensionMaifest, false);
            });
        });
    }
});
//# sourceMappingURL=extensionManifestPropertiesService.test.js.map