/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfigurationServiceImpl", "vs/base/common/uri"], function (require, exports, assert, testConfigurationService_1, instantiationServiceMock_1, modelService_1, modeService_1, configuration_1, textResourceConfigurationServiceImpl_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TextResourceConfigurationService - Update', () => {
        let configurationValue = {};
        let updateArgs;
        let configurationService = new class extends testConfigurationService_1.TestConfigurationService {
            inspect() {
                return configurationValue;
            }
            updateValue() {
                updateArgs = [...arguments];
                return Promise.resolve();
            }
        }();
        let language = null;
        let testObject;
        setup(() => {
            const instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(modelService_1.IModelService, { getModel() { return null; } });
            instantiationService.stub(modeService_1.IModeService, { getModeIdByFilepathOrFirstLine() { return language; } });
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            testObject = instantiationService.createInstance(textResourceConfigurationServiceImpl_1.TextResourceConfigurationService);
        });
        test('updateValue writes without target and overrides when no language is defined', async () => {
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes with target and without overrides when no language is defined', async () => {
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 2 /* USER_LOCAL */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes into given memory target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 7 /* MEMORY */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 7 /* MEMORY */]);
        });
        test('updateValue writes into given workspace target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 4 /* WORKSPACE */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 4 /* WORKSPACE */]);
        });
        test('updateValue writes into given user target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 1 /* USER */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 1 /* USER */]);
        });
        test('updateValue writes into given workspace folder target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2', override: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b', 5 /* WORKSPACE_FOLDER */);
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 5 /* WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace folder target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 5 /* WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace folder target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '1' },
                workspaceFolder: { value: '2', override: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 5 /* WORKSPACE_FOLDER */]);
        });
        test('updateValue writes into derived workspace target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 4 /* WORKSPACE */]);
        });
        test('updateValue writes into derived workspace target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 4 /* WORKSPACE */]);
        });
        test('updateValue writes into derived workspace target with overrides and value defined in folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1', override: '3' },
                userLocal: { value: '2' },
                workspace: { value: '2', override: '2' },
                workspaceFolder: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 4 /* WORKSPACE */]);
        });
        test('updateValue writes into derived user remote target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 3 /* USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2', override: '3' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 3 /* USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides and value defined in workspace', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
                userRemote: { value: '2', override: '3' },
                workspace: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 3 /* USER_REMOTE */]);
        });
        test('updateValue writes into derived user remote target with overrides and value defined in workspace folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '1' },
                userRemote: { value: '2', override: '3' },
                workspace: { value: '3' },
                workspaceFolder: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource, overrideIdentifier: language }, 3 /* USER_REMOTE */]);
        });
        test('updateValue writes into derived user target without overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in remote', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
                userRemote: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in workspace', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
                userLocal: { value: '2', override: '3' },
                workspaceValue: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 2 /* USER_LOCAL */]);
        });
        test('updateValue writes into derived user target with overrides and value is defined in workspace folder', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1', override: '3' },
                userLocal: { value: '2', override: '3' },
                userRemote: { value: '3' },
                workspaceFolderValue: { value: '3' }
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', '2');
            assert.deepStrictEqual(updateArgs, ['a', '2', { resource, overrideIdentifier: language }, 2 /* USER_LOCAL */]);
        });
        test('updateValue when not changed', async () => {
            language = 'a';
            configurationValue = {
                default: { value: '1' },
            };
            const resource = uri_1.URI.file('someFile');
            await testObject.updateValue(resource, 'a', 'b');
            assert.deepStrictEqual(updateArgs, ['a', 'b', { resource }, 2 /* USER_LOCAL */]);
        });
    });
});
//# sourceMappingURL=textResourceConfigurationService.test.js.map