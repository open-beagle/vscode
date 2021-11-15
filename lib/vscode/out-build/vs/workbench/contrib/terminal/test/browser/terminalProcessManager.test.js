/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/workbench/contrib/terminal/common/environmentVariableService", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, assert_1, configuration_1, terminalConfigHelper_1, terminalProcessManager_1, testConfigurationService_1, workbenchTestServices_1, productService_1, environmentVariable_1, environmentVariableService_1, network_1, uri_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - TerminalProcessManager', () => {
        let instantiationService;
        let manager;
        setup(async () => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const configurationService = new testConfigurationService_1.TestConfigurationService();
            await configurationService.setUserConfiguration('editor', { fontFamily: 'foo' });
            await configurationService.setUserConfiguration('terminal', {
                integrated: {
                    fontFamily: 'bar',
                    enablePersistentSessions: true
                }
            });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(productService_1.IProductService, workbenchTestServices_1.TestProductService);
            instantiationService.stub(environmentVariable_1.IEnvironmentVariableService, instantiationService.createInstance(environmentVariableService_1.EnvironmentVariableService));
            instantiationService.stub(terminal_1.ITerminalProfileResolverService, workbenchTestServices_1.TestTerminalProfileResolverService);
            const configHelper = instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper);
            manager = instantiationService.createInstance(terminalProcessManager_1.TerminalProcessManager, 1, configHelper);
        });
        suite('process persistence', () => {
            suite('local', () => {
                test('regular terminal should persist', async () => {
                    const p = await manager.createProcess({}, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, true);
                });
                test('task terminal should not persist', async () => {
                    const p = await manager.createProcess({
                        isFeatureTerminal: true
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, false);
                });
            });
            suite('remote', () => {
                const remoteCwd = uri_1.URI.from({
                    scheme: network_1.Schemas.vscodeRemote,
                    path: 'test/cwd'
                });
                test('regular terminal should persist', async () => {
                    const p = await manager.createProcess({
                        cwd: remoteCwd
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, true);
                });
                test('task terminal should not persist', async () => {
                    const p = await manager.createProcess({
                        isFeatureTerminal: true,
                        cwd: remoteCwd
                    }, 1, 1, false);
                    (0, assert_1.strictEqual)(p, undefined);
                    (0, assert_1.strictEqual)(manager.shouldPersist, false);
                });
            });
        });
    });
});
//# sourceMappingURL=terminalProcessManager.test.js.map