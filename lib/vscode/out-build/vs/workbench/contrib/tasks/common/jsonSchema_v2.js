/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/jsonSchema_v2", "vs/base/common/objects", "./jsonSchemaCommon", "vs/workbench/contrib/tasks/common/problemMatcher", "./taskDefinitionRegistry", "vs/workbench/services/configurationResolver/common/configurationResolverUtils", "vs/workbench/services/configurationResolver/common/configurationResolverSchema"], function (require, exports, nls, Objects, jsonSchemaCommon_1, problemMatcher_1, taskDefinitionRegistry_1, ConfigurationResolverUtils, configurationResolverSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateProblemMatchers = exports.updateTaskDefinitions = void 0;
    function fixReferences(literal) {
        if (Array.isArray(literal)) {
            literal.forEach(fixReferences);
        }
        else if (typeof literal === 'object') {
            if (literal['$ref']) {
                literal['$ref'] = literal['$ref'] + '2';
            }
            Object.getOwnPropertyNames(literal).forEach(property => {
                let value = literal[property];
                if (Array.isArray(value) || typeof value === 'object') {
                    fixReferences(value);
                }
            });
        }
    }
    const shellCommand = {
        anyOf: [
            {
                type: 'boolean',
                default: true,
                description: nls.localize(0, null)
            },
            {
                $ref: '#definitions/shellConfiguration'
            }
        ],
        deprecationMessage: nls.localize(1, null)
    };
    const taskIdentifier = {
        type: 'object',
        additionalProperties: true,
        properties: {
            type: {
                type: 'string',
                description: nls.localize(2, null)
            }
        }
    };
    const dependsOn = {
        anyOf: [
            {
                type: 'string',
                description: nls.localize(3, null)
            },
            taskIdentifier,
            {
                type: 'array',
                description: nls.localize(4, null),
                items: {
                    anyOf: [
                        {
                            type: 'string',
                        },
                        taskIdentifier
                    ]
                }
            }
        ],
        description: nls.localize(5, null)
    };
    const dependsOrder = {
        type: 'string',
        enum: ['parallel', 'sequence'],
        enumDescriptions: [
            nls.localize(6, null),
            nls.localize(7, null),
        ],
        default: 'parallel',
        description: nls.localize(8, null)
    };
    const detail = {
        type: 'string',
        description: nls.localize(9, null)
    };
    const presentation = {
        type: 'object',
        default: {
            echo: true,
            reveal: 'always',
            focus: false,
            panel: 'shared',
            showReuseMessage: true,
            clear: false,
        },
        description: nls.localize(10, null),
        additionalProperties: false,
        properties: {
            echo: {
                type: 'boolean',
                default: true,
                description: nls.localize(11, null)
            },
            focus: {
                type: 'boolean',
                default: false,
                description: nls.localize(12, null)
            },
            revealProblems: {
                type: 'string',
                enum: ['always', 'onProblem', 'never'],
                enumDescriptions: [
                    nls.localize(13, null),
                    nls.localize(14, null),
                    nls.localize(15, null),
                ],
                default: 'never',
                description: nls.localize(16, null)
            },
            reveal: {
                type: 'string',
                enum: ['always', 'silent', 'never'],
                enumDescriptions: [
                    nls.localize(17, null),
                    nls.localize(18, null),
                    nls.localize(19, null),
                ],
                default: 'always',
                description: nls.localize(20, null)
            },
            panel: {
                type: 'string',
                enum: ['shared', 'dedicated', 'new'],
                default: 'shared',
                description: nls.localize(21, null)
            },
            showReuseMessage: {
                type: 'boolean',
                default: true,
                description: nls.localize(22, null)
            },
            clear: {
                type: 'boolean',
                default: false,
                description: nls.localize(23, null)
            },
            group: {
                type: 'string',
                description: nls.localize(24, null)
            },
        }
    };
    const terminal = Objects.deepClone(presentation);
    terminal.deprecationMessage = nls.localize(25, null);
    const group = {
        oneOf: [
            {
                type: 'string',
            },
            {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        default: 'none',
                        description: nls.localize(26, null)
                    },
                    isDefault: {
                        type: 'boolean',
                        default: false,
                        description: nls.localize(27, null)
                    }
                }
            },
        ],
        enum: [
            { kind: 'build', isDefault: true },
            { kind: 'test', isDefault: true },
            'build',
            'test',
            'none'
        ],
        enumDescriptions: [
            nls.localize(28, null),
            nls.localize(29, null),
            nls.localize(30, null),
            nls.localize(31, null),
            nls.localize(32, null)
        ],
        description: nls.localize(33, null)
    };
    const taskType = {
        type: 'string',
        enum: ['shell'],
        default: 'process',
        description: nls.localize(34, null)
    };
    const command = {
        oneOf: [
            {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: nls.localize(35, null)
                    }
                ]
            },
            {
                type: 'object',
                required: ['value', 'quoting'],
                properties: {
                    value: {
                        oneOf: [
                            {
                                type: 'string'
                            },
                            {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: nls.localize(36, null)
                            }
                        ],
                        description: nls.localize(37, null)
                    },
                    quoting: {
                        type: 'string',
                        enum: ['escape', 'strong', 'weak'],
                        enumDescriptions: [
                            nls.localize(38, null),
                            nls.localize(39, null),
                            nls.localize(40, null),
                        ],
                        default: 'strong',
                        description: nls.localize(41, null)
                    }
                }
            }
        ],
        description: nls.localize(42, null)
    };
    const args = {
        type: 'array',
        items: {
            oneOf: [
                {
                    type: 'string',
                },
                {
                    type: 'object',
                    required: ['value', 'quoting'],
                    properties: {
                        value: {
                            type: 'string',
                            description: nls.localize(43, null)
                        },
                        quoting: {
                            type: 'string',
                            enum: ['escape', 'strong', 'weak'],
                            enumDescriptions: [
                                nls.localize(44, null),
                                nls.localize(45, null),
                                nls.localize(46, null),
                            ],
                            default: 'strong',
                            description: nls.localize(47, null)
                        }
                    }
                }
            ]
        },
        description: nls.localize(48, null)
    };
    const label = {
        type: 'string',
        description: nls.localize(49, null)
    };
    const version = {
        type: 'string',
        enum: ['2.0.0'],
        description: nls.localize(50, null)
    };
    const identifier = {
        type: 'string',
        description: nls.localize(51, null),
        deprecationMessage: nls.localize(52, null)
    };
    const runOptions = {
        type: 'object',
        additionalProperties: false,
        properties: {
            reevaluateOnRerun: {
                type: 'boolean',
                description: nls.localize(53, null),
                default: true
            },
            runOn: {
                type: 'string',
                enum: ['default', 'folderOpen'],
                description: nls.localize(54, null),
                default: 'default'
            },
            instanceLimit: {
                type: 'number',
                description: nls.localize(55, null),
                default: 1
            },
        },
        description: nls.localize(56, null)
    };
    const commonSchemaDefinitions = jsonSchemaCommon_1.default.definitions;
    const options = Objects.deepClone(commonSchemaDefinitions.options);
    const optionsProperties = options.properties;
    optionsProperties.shell = Objects.deepClone(commonSchemaDefinitions.shellConfiguration);
    let taskConfiguration = {
        type: 'object',
        additionalProperties: false,
        properties: {
            label: {
                type: 'string',
                description: nls.localize(57, null)
            },
            taskName: {
                type: 'string',
                description: nls.localize(58, null),
                deprecationMessage: nls.localize(59, null)
            },
            identifier: Objects.deepClone(identifier),
            group: Objects.deepClone(group),
            isBackground: {
                type: 'boolean',
                description: nls.localize(60, null),
                default: true
            },
            promptOnClose: {
                type: 'boolean',
                description: nls.localize(61, null),
                default: false
            },
            presentation: Objects.deepClone(presentation),
            options: options,
            problemMatcher: {
                $ref: '#/definitions/problemMatcherType',
                description: nls.localize(62, null)
            },
            runOptions: Objects.deepClone(runOptions),
            dependsOn: Objects.deepClone(dependsOn),
            dependsOrder: Objects.deepClone(dependsOrder),
            detail: Objects.deepClone(detail),
        }
    };
    let taskDefinitions = [];
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onReady().then(() => {
        updateTaskDefinitions();
    });
    function updateTaskDefinitions() {
        for (let taskType of taskDefinitionRegistry_1.TaskDefinitionRegistry.all()) {
            // Check that we haven't already added this task type
            if (taskDefinitions.find(schema => {
                var _a, _b, _c, _d;
                return ((_c = (_b = (_a = schema.properties) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.enum) === null || _c === void 0 ? void 0 : _c.find) ? (_d = schema.properties) === null || _d === void 0 ? void 0 : _d.type.enum.find(element => element === taskType.taskType) : undefined;
            })) {
                continue;
            }
            let schema = Objects.deepClone(taskConfiguration);
            const schemaProperties = schema.properties;
            // Since we do this after the schema is assigned we need to patch the refs.
            schemaProperties.type = {
                type: 'string',
                description: nls.localize(63, null),
                enum: [taskType.taskType]
            };
            if (taskType.required) {
                schema.required = taskType.required.slice();
            }
            else {
                schema.required = [];
            }
            // Customized tasks require that the task type be set.
            schema.required.push('type');
            if (taskType.properties) {
                for (let key of Object.keys(taskType.properties)) {
                    let property = taskType.properties[key];
                    schemaProperties[key] = Objects.deepClone(property);
                }
            }
            fixReferences(schema);
            taskDefinitions.push(schema);
        }
    }
    exports.updateTaskDefinitions = updateTaskDefinitions;
    let customize = Objects.deepClone(taskConfiguration);
    customize.properties.customize = {
        type: 'string',
        deprecationMessage: nls.localize(64, null)
    };
    if (!customize.required) {
        customize.required = [];
    }
    customize.required.push('customize');
    taskDefinitions.push(customize);
    let definitions = Objects.deepClone(commonSchemaDefinitions);
    let taskDescription = definitions.taskDescription;
    taskDescription.required = ['label'];
    const taskDescriptionProperties = taskDescription.properties;
    taskDescriptionProperties.label = Objects.deepClone(label);
    taskDescriptionProperties.command = Objects.deepClone(command);
    taskDescriptionProperties.args = Objects.deepClone(args);
    taskDescriptionProperties.isShellCommand = Objects.deepClone(shellCommand);
    taskDescriptionProperties.dependsOn = dependsOn;
    taskDescriptionProperties.dependsOrder = dependsOrder;
    taskDescriptionProperties.identifier = Objects.deepClone(identifier);
    taskDescriptionProperties.type = Objects.deepClone(taskType);
    taskDescriptionProperties.presentation = Objects.deepClone(presentation);
    taskDescriptionProperties.terminal = terminal;
    taskDescriptionProperties.group = Objects.deepClone(group);
    taskDescriptionProperties.runOptions = Objects.deepClone(runOptions);
    taskDescriptionProperties.detail = detail;
    taskDescriptionProperties.taskName.deprecationMessage = nls.localize(65, null);
    // Clone the taskDescription for process task before setting a default to prevent two defaults #115281
    const processTask = Objects.deepClone(taskDescription);
    taskDescription.default = {
        label: 'My Task',
        type: 'shell',
        command: 'echo Hello',
        problemMatcher: []
    };
    definitions.showOutputType.deprecationMessage = nls.localize(66, null);
    taskDescriptionProperties.echoCommand.deprecationMessage = nls.localize(67, null);
    taskDescriptionProperties.suppressTaskName.deprecationMessage = nls.localize(68, null);
    taskDescriptionProperties.isBuildCommand.deprecationMessage = nls.localize(69, null);
    taskDescriptionProperties.isTestCommand.deprecationMessage = nls.localize(70, null);
    // Process tasks are almost identical schema-wise to shell tasks, but they are required to have a command
    processTask.properties.type = {
        type: 'string',
        enum: ['process'],
        default: 'process',
        description: nls.localize(71, null)
    };
    processTask.required.push('command');
    processTask.required.push('type');
    taskDefinitions.push(processTask);
    taskDefinitions.push({
        $ref: '#/definitions/taskDescription'
    });
    const definitionsTaskRunnerConfigurationProperties = definitions.taskRunnerConfiguration.properties;
    let tasks = definitionsTaskRunnerConfigurationProperties.tasks;
    tasks.items = {
        oneOf: taskDefinitions
    };
    definitionsTaskRunnerConfigurationProperties.inputs = configurationResolverSchema_1.inputsSchema.definitions.inputs;
    definitions.commandConfiguration.properties.isShellCommand = Objects.deepClone(shellCommand);
    definitions.commandConfiguration.properties.args = Objects.deepClone(args);
    definitions.options.properties.shell = {
        $ref: '#/definitions/shellConfiguration'
    };
    definitionsTaskRunnerConfigurationProperties.isShellCommand = Objects.deepClone(shellCommand);
    definitionsTaskRunnerConfigurationProperties.type = Objects.deepClone(taskType);
    definitionsTaskRunnerConfigurationProperties.group = Objects.deepClone(group);
    definitionsTaskRunnerConfigurationProperties.presentation = Objects.deepClone(presentation);
    definitionsTaskRunnerConfigurationProperties.suppressTaskName.deprecationMessage = nls.localize(72, null);
    definitionsTaskRunnerConfigurationProperties.taskSelector.deprecationMessage = nls.localize(73, null);
    let osSpecificTaskRunnerConfiguration = Objects.deepClone(definitions.taskRunnerConfiguration);
    delete osSpecificTaskRunnerConfiguration.properties.tasks;
    osSpecificTaskRunnerConfiguration.additionalProperties = false;
    definitions.osSpecificTaskRunnerConfiguration = osSpecificTaskRunnerConfiguration;
    definitionsTaskRunnerConfigurationProperties.version = Objects.deepClone(version);
    const schema = {
        oneOf: [
            {
                'allOf': [
                    {
                        type: 'object',
                        required: ['version'],
                        properties: {
                            version: Objects.deepClone(version),
                            windows: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(74, null)
                            },
                            osx: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(75, null)
                            },
                            linux: {
                                '$ref': '#/definitions/osSpecificTaskRunnerConfiguration',
                                'description': nls.localize(76, null)
                            }
                        }
                    },
                    {
                        $ref: '#/definitions/taskRunnerConfiguration'
                    }
                ]
            }
        ]
    };
    schema.definitions = definitions;
    function deprecatedVariableMessage(schemaMap, property) {
        const mapAtProperty = schemaMap[property].properties;
        if (mapAtProperty) {
            Object.keys(mapAtProperty).forEach(name => {
                deprecatedVariableMessage(mapAtProperty, name);
            });
        }
        else {
            ConfigurationResolverUtils.applyDeprecatedVariableMessage(schemaMap[property]);
        }
    }
    Object.getOwnPropertyNames(definitions).forEach(key => {
        let newKey = key + '2';
        definitions[newKey] = definitions[key];
        delete definitions[key];
        deprecatedVariableMessage(definitions, newKey);
    });
    fixReferences(schema);
    function updateProblemMatchers() {
        try {
            let matcherIds = problemMatcher_1.ProblemMatcherRegistry.keys().map(key => '$' + key);
            definitions.problemMatcherType2.oneOf[0].enum = matcherIds;
            definitions.problemMatcherType2.oneOf[2].items.anyOf[0].enum = matcherIds;
        }
        catch (err) {
            console.log('Installing problem matcher ids failed');
        }
    }
    exports.updateProblemMatchers = updateProblemMatchers;
    problemMatcher_1.ProblemMatcherRegistry.onReady().then(() => {
        updateProblemMatchers();
    });
    exports.default = schema;
});
//# sourceMappingURL=jsonSchema_v2.js.map