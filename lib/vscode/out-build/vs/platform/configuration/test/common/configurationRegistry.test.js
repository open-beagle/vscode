/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry"], function (require, exports, assert, platform_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ConfigurationRegistry', () => {
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        test('configuration override', async () => {
            configurationRegistry.registerConfiguration({
                'id': '_test_default',
                'type': 'object',
                'properties': {
                    'config': {
                        'type': 'object',
                    }
                }
            });
            configurationRegistry.registerDefaultConfigurations([{ 'config': { a: 1, b: 2 } }]);
            configurationRegistry.registerDefaultConfigurations([{ '[lang]': { a: 2, c: 3 } }]);
            assert.deepStrictEqual(configurationRegistry.getConfigurationProperties()['config'].default, { a: 1, b: 2 });
            assert.deepStrictEqual(configurationRegistry.getConfigurationProperties()['[lang]'].default, { a: 2, c: 3 });
        });
        test('configuration override defaults - merges defaults', async () => {
            configurationRegistry.registerDefaultConfigurations([{ '[lang]': { a: 1, b: 2 } }]);
            configurationRegistry.registerDefaultConfigurations([{ '[lang]': { a: 2, c: 3 } }]);
            assert.deepStrictEqual(configurationRegistry.getConfigurationProperties()['[lang]'].default, { a: 2, b: 2, c: 3 });
        });
        test('configuration defaults - overrides defaults', async () => {
            configurationRegistry.registerConfiguration({
                'id': '_test_default',
                'type': 'object',
                'properties': {
                    'config': {
                        'type': 'object',
                    }
                }
            });
            configurationRegistry.registerDefaultConfigurations([{ 'config': { a: 1, b: 2 } }]);
            configurationRegistry.registerDefaultConfigurations([{ 'config': { a: 2, c: 3 } }]);
            assert.deepStrictEqual(configurationRegistry.getConfigurationProperties()['config'].default, { a: 2, c: 3 });
        });
    });
});
//# sourceMappingURL=configurationRegistry.test.js.map