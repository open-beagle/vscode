/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/selection", "vs/editor/common/editorCommon", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/workbench/services/configurationResolver/browser/configurationResolverService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/test/electron-browser/workbenchTestServices"], function (require, exports, assert, event_1, lifecycle_1, path_1, platform, types_1, uri_1, selection_1, editorCommon_1, testConfigurationService_1, testWorkspace_1, configurationResolverService_1, environmentService_1, workbenchTestServices_1, workbenchTestServices_2, workbenchTestServices_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const mockLineNumber = 10;
    class TestEditorServiceWithActiveEditor extends workbenchTestServices_1.TestEditorService {
        get activeTextEditorControl() {
            return {
                getEditorType() {
                    return editorCommon_1.EditorType.ICodeEditor;
                },
                getSelection() {
                    return new selection_1.Selection(mockLineNumber, 1, mockLineNumber, 10);
                }
            };
        }
        get activeEditor() {
            return {
                get resource() {
                    return uri_1.URI.parse('file:///VSCode/workspaceLocation/file');
                }
            };
        }
    }
    class TestConfigurationResolverService extends configurationResolverService_1.BaseConfigurationResolverService {
    }
    const nullContext = {
        getAppRoot: () => undefined,
        getExecPath: () => undefined
    };
    suite('Configuration Resolver Service', () => {
        let configurationResolverService;
        let envVariables = { key1: 'Value for key1', key2: 'Value for key2' };
        let environmentService;
        let mockCommandService;
        let editorService;
        let containingWorkspace;
        let workspace;
        let quickInputService;
        let labelService;
        setup(() => {
            mockCommandService = new MockCommandService();
            editorService = new TestEditorServiceWithActiveEditor();
            quickInputService = new workbenchTestServices_1.TestQuickInputService();
            environmentService = new MockWorkbenchEnvironmentService(envVariables);
            labelService = new MockLabelService();
            containingWorkspace = (0, testWorkspace_1.testWorkspace)(uri_1.URI.parse('file:///VSCode/workspaceLocation'));
            workspace = containingWorkspace.folders[0];
            configurationResolverService = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), editorService, new MockInputsConfigurationService(), mockCommandService, new workbenchTestServices_2.TestContextService(containingWorkspace), quickInputService, labelService);
        });
        teardown(() => {
            configurationResolverService = null;
        });
        test('substitute one', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with argument', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with invalid argument', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder:invalidLocation} xyz'));
        });
        test('workspace folder with undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder} xyz'));
        });
        test('workspace folder with argument and undefined workspace folder', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc \\VSCode\\workspaceLocation xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:workspaceLocation} xyz'), 'abc /VSCode/workspaceLocation xyz');
            }
        });
        test('workspace folder with invalid argument and undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${workspaceFolder:invalidLocation} xyz'));
        });
        test('workspace root folder name', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceRootFolderName} xyz'), 'abc workspaceLocation xyz');
        });
        test('current selected line number', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${lineNumber} xyz'), `abc ${mockLineNumber} xyz`);
        });
        test('relative file', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile} xyz'), 'abc file xyz');
        });
        test('relative file with argument', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile:workspaceLocation} xyz'), 'abc file xyz');
        });
        test('relative file with invalid argument', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, 'abc ${relativeFile:invalidLocation} xyz'));
        });
        test('relative file with undefined workspace folder', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile} xyz'), 'abc \\VSCode\\workspaceLocation\\file xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile} xyz'), 'abc /VSCode/workspaceLocation/file xyz');
            }
        });
        test('relative file with argument and undefined workspace folder', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile:workspaceLocation} xyz'), 'abc file xyz');
        });
        test('relative file with invalid argument and undefined workspace folder', () => {
            assert.rejects(async () => await configurationResolverService.resolveAsync(undefined, 'abc ${relativeFile:invalidLocation} xyz'));
        });
        test('substitute many', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder}'), '\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder}'), '/VSCode/workspaceLocation - /VSCode/workspaceLocation');
            }
        });
        test('substitute one env variable', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} ${env:key1} xyz'), 'abc \\VSCode\\workspaceLocation Value for key1 xyz');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, 'abc ${workspaceFolder} ${env:key1} xyz'), 'abc /VSCode/workspaceLocation Value for key1 xyz');
            }
        });
        test('substitute many env variable', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), '\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), '/VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2');
            }
        });
        test('disallows nested keys (#77289)', async () => {
            assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} ${env:key1${env:key2}}'), 'Value for key1 ${env:key1${env:key2}}');
        });
        // test('substitute keys and values in object', () => {
        // 	const myObject = {
        // 		'${workspaceRootFolderName}': '${lineNumber}',
        // 		'hey ${env:key1} ': '${workspaceRootFolderName}'
        // 	};
        // 	assert.deepStrictEqual(configurationResolverService!.resolveAsync(workspace, myObject), {
        // 		'workspaceLocation': `${editorService.mockLineNumber}`,
        // 		'hey Value for key1 ': 'workspaceLocation'
        // 	});
        // });
        test('substitute one env variable using platform case sensitivity', async () => {
            if (platform.isWindows) {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} - ${env:Key1}'), 'Value for key1 - Value for key1');
            }
            else {
                assert.strictEqual(await configurationResolverService.resolveAsync(workspace, '${env:key1} - ${env:Key1}'), 'Value for key1 - ');
            }
        });
        test('substitute one configuration variable', async () => {
            let configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} xyz'), 'abc foo xyz');
        });
        test('substitute configuration variable with undefined workspace folder', async () => {
            let configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.strictEqual(await service.resolveAsync(undefined, 'abc ${config:editor.fontFamily} xyz'), 'abc foo xyz');
        });
        test('substitute many configuration variables', async () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} xyz'), 'abc foo bar xyz');
        });
        test('substitute one env variable and a configuration variable', async () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            if (platform.isWindows) {
                assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz'), 'abc foo \\VSCode\\workspaceLocation Value for key1 xyz');
            }
            else {
                assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz'), 'abc foo /VSCode/workspaceLocation Value for key1 xyz');
            }
        });
        test('substitute many env variable and a configuration variable', async () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            if (platform.isWindows) {
                assert.strictEqual(await service.resolveAsync(workspace, '${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), 'foo bar \\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2');
            }
            else {
                assert.strictEqual(await service.resolveAsync(workspace, '${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}'), 'foo bar /VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2');
            }
        });
        test('mixed types of configuration variables', async () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo',
                    lineNumbers: 123,
                    insertSpaces: false
                },
                terminal: {
                    integrated: {
                        fontFamily: 'bar'
                    }
                },
                json: {
                    schemas: [
                        {
                            fileMatch: [
                                '/myfile',
                                '/myOtherfile'
                            ],
                            url: 'schemaURL'
                        }
                    ]
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${config:editor.fontFamily} ${config:editor.lineNumbers} ${config:editor.insertSpaces} xyz'), 'abc foo 123 false xyz');
        });
        test('uses original variable as fallback', async () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {}
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${unknownVariable} xyz'), 'abc ${unknownVariable} xyz');
            assert.strictEqual(await service.resolveAsync(workspace, 'abc ${env:unknownVariable} xyz'), 'abc  xyz');
        });
        test('configuration variables with invalid accessor', () => {
            let configurationService;
            configurationService = new testConfigurationService_1.TestConfigurationService({
                editor: {
                    fontFamily: 'foo'
                }
            });
            let service = new TestConfigurationResolverService(nullContext, Promise.resolve(environmentService.userEnv), new TestEditorServiceWithActiveEditor(), configurationService, mockCommandService, new workbenchTestServices_2.TestContextService(), quickInputService, labelService);
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${env} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${env:} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor..fontFamily} xyz'));
            assert.rejects(async () => await service.resolveAsync(workspace, 'abc ${config:editor.none.none2} xyz'));
        });
        test('a single command variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:command1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration).then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('an old style command variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('multiple new and old-style command variables', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'pid': '${command:command2}',
                'sourceMaps': false,
                'outDir': 'src/${command:command2}',
                'env': {
                    'processId': '__${command:command2}__',
                }
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                const expected = {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'command1-result',
                    'pid': 'command2-result',
                    'sourceMaps': false,
                    'outDir': 'src/command2-result',
                    'env': {
                        'processId': '__command2-result__',
                    }
                };
                assert.deepStrictEqual(Object.keys(result), Object.keys(expected));
                Object.keys(result).forEach(property => {
                    const expectedProperty = expected[property];
                    if ((0, types_1.isObject)(result[property])) {
                        assert.deepStrictEqual(Object.assign({}, result[property]), expectedProperty);
                    }
                    else {
                        assert.deepStrictEqual(result[property], expectedProperty);
                    }
                });
                assert.strictEqual(2, mockCommandService.callCount);
            });
        });
        test('a command variable that relies on resolved env vars', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${command:commandVariable1}',
                'value': '${env:key1}'
            };
            const commandVariables = Object.create(null);
            commandVariables['commandVariable1'] = 'command1';
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, undefined, commandVariables).then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'Value for key1',
                    'value': 'Value for key1'
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('a single prompt input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'resolvedEnterinput1',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('a single pick input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input2}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'selectedPick',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('a single command input variable', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input4}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'arg for command',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(1, mockCommandService.callCount);
            });
        });
        test('several input variables and command', () => {
            const configuration = {
                'name': '${input:input3}',
                'type': '${command:command1}',
                'request': '${input:input1}',
                'processId': '${input:input2}',
                'command': '${input:input4}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, 'tasks').then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'resolvedEnterinput3',
                    'type': 'command1-result',
                    'request': 'resolvedEnterinput1',
                    'processId': 'selectedPick',
                    'command': 'arg for command',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(2, mockCommandService.callCount);
            });
        });
        test('input variable with undefined workspace folder', () => {
            const configuration = {
                'name': 'Attach to Process',
                'type': 'node',
                'request': 'attach',
                'processId': '${input:input1}',
                'port': 5858,
                'sourceMaps': false,
                'outDir': null
            };
            return configurationResolverService.resolveWithInteractionReplace(undefined, configuration, 'tasks').then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': 'Attach to Process',
                    'type': 'node',
                    'request': 'attach',
                    'processId': 'resolvedEnterinput1',
                    'port': 5858,
                    'sourceMaps': false,
                    'outDir': null
                });
                assert.strictEqual(0, mockCommandService.callCount);
            });
        });
        test('contributed variable', () => {
            const buildTask = 'npm: compile';
            const variable = 'defaultBuildTask';
            const configuration = {
                'name': '${' + variable + '}',
            };
            configurationResolverService.contributeVariable(variable, async () => { return buildTask; });
            return configurationResolverService.resolveWithInteractionReplace(workspace, configuration).then(result => {
                assert.deepStrictEqual(Object.assign({}, result), {
                    'name': `${buildTask}`
                });
            });
        });
    });
    class MockCommandService {
        constructor() {
            this.callCount = 0;
            this.onWillExecuteCommand = () => lifecycle_1.Disposable.None;
            this.onDidExecuteCommand = () => lifecycle_1.Disposable.None;
        }
        executeCommand(commandId, ...args) {
            this.callCount++;
            let result = `${commandId}-result`;
            if (args.length >= 1) {
                if (args[0] && args[0].value) {
                    result = args[0].value;
                }
            }
            return Promise.resolve(result);
        }
    }
    class MockLabelService {
        constructor() {
            this.onDidChangeFormatters = new event_1.Emitter().event;
        }
        getUriLabel(resource, options) {
            return (0, path_1.normalize)(resource.fsPath);
        }
        getUriBasenameLabel(resource) {
            throw new Error('Method not implemented.');
        }
        getWorkspaceLabel(workspace, options) {
            throw new Error('Method not implemented.');
        }
        getHostLabel(scheme, authority) {
            throw new Error('Method not implemented.');
        }
        getSeparator(scheme, authority) {
            throw new Error('Method not implemented.');
        }
        registerFormatter(formatter) {
            throw new Error('Method not implemented.');
        }
    }
    class MockInputsConfigurationService extends testConfigurationService_1.TestConfigurationService {
        getValue(arg1, arg2) {
            let configuration;
            if (arg1 === 'tasks') {
                configuration = {
                    inputs: [
                        {
                            id: 'input1',
                            type: 'promptString',
                            description: 'Enterinput1',
                            default: 'default input1'
                        },
                        {
                            id: 'input2',
                            type: 'pickString',
                            description: 'Enterinput1',
                            default: 'option2',
                            options: ['option1', 'option2', 'option3']
                        },
                        {
                            id: 'input3',
                            type: 'promptString',
                            description: 'Enterinput3',
                            default: 'default input3',
                            password: true
                        },
                        {
                            id: 'input4',
                            type: 'command',
                            command: 'command1',
                            args: {
                                value: 'arg for command'
                            }
                        }
                    ]
                };
            }
            return configuration;
        }
    }
    class MockWorkbenchEnvironmentService extends environmentService_1.NativeWorkbenchEnvironmentService {
        constructor(userEnv) {
            super(Object.assign(Object.assign({}, workbenchTestServices_3.TestWorkbenchConfiguration), { userEnv }), workbenchTestServices_1.TestProductService);
            this.userEnv = userEnv;
        }
    }
});
//# sourceMappingURL=configurationResolverService.test.js.map