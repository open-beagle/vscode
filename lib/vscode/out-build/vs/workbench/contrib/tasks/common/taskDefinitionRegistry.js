/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/taskDefinitionRegistry", "vs/base/common/types", "vs/base/common/objects", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/event"], function (require, exports, nls, Types, Objects, extensionsRegistry_1, contextkey_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskDefinitionRegistry = void 0;
    const taskDefinitionSchema = {
        type: 'object',
        additionalProperties: false,
        properties: {
            type: {
                type: 'string',
                description: nls.localize(0, null)
            },
            required: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            properties: {
                type: 'object',
                description: nls.localize(1, null),
                additionalProperties: {
                    $ref: 'http://json-schema.org/draft-07/schema#'
                }
            },
            when: {
                type: 'string',
                markdownDescription: nls.localize(2, null),
                default: ''
            }
        }
    };
    var Configuration;
    (function (Configuration) {
        function from(value, extensionId, messageCollector) {
            if (!value) {
                return undefined;
            }
            let taskType = Types.isString(value.type) ? value.type : undefined;
            if (!taskType || taskType.length === 0) {
                messageCollector.error(nls.localize(3, null));
                return undefined;
            }
            let required = [];
            if (Array.isArray(value.required)) {
                for (let element of value.required) {
                    if (Types.isString(element)) {
                        required.push(element);
                    }
                }
            }
            return {
                extensionId: extensionId.value,
                taskType, required: required,
                properties: value.properties ? Objects.deepClone(value.properties) : {},
                when: value.when ? contextkey_1.ContextKeyExpr.deserialize(value.when) : undefined
            };
        }
        Configuration.from = from;
    })(Configuration || (Configuration = {}));
    const taskDefinitionsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'taskDefinitions',
        jsonSchema: {
            description: nls.localize(4, null),
            type: 'array',
            items: taskDefinitionSchema
        }
    });
    class TaskDefinitionRegistryImpl {
        constructor() {
            this._onDefinitionsChanged = new event_1.Emitter();
            this.onDefinitionsChanged = this._onDefinitionsChanged.event;
            this.taskTypes = Object.create(null);
            this.readyPromise = new Promise((resolve, reject) => {
                taskDefinitionsExtPoint.setHandler((extensions, delta) => {
                    try {
                        for (let extension of delta.removed) {
                            let taskTypes = extension.value;
                            for (let taskType of taskTypes) {
                                if (this.taskTypes && taskType.type && this.taskTypes[taskType.type]) {
                                    delete this.taskTypes[taskType.type];
                                }
                            }
                        }
                        for (let extension of delta.added) {
                            let taskTypes = extension.value;
                            for (let taskType of taskTypes) {
                                let type = Configuration.from(taskType, extension.description.identifier, extension.collector);
                                if (type) {
                                    this.taskTypes[type.taskType] = type;
                                }
                            }
                        }
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this._onDefinitionsChanged.fire();
                        }
                    }
                    catch (error) {
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            return this.readyPromise;
        }
        get(key) {
            return this.taskTypes[key];
        }
        all() {
            return Object.keys(this.taskTypes).map(key => this.taskTypes[key]);
        }
        getJsonSchema() {
            if (this._schema === undefined) {
                let schemas = [];
                for (let definition of this.all()) {
                    let schema = {
                        type: 'object',
                        additionalProperties: false
                    };
                    if (definition.required.length > 0) {
                        schema.required = definition.required.slice(0);
                    }
                    if (definition.properties !== undefined) {
                        schema.properties = Objects.deepClone(definition.properties);
                    }
                    else {
                        schema.properties = Object.create(null);
                    }
                    schema.properties.type = {
                        type: 'string',
                        enum: [definition.taskType]
                    };
                    schemas.push(schema);
                }
                this._schema = { oneOf: schemas };
            }
            return this._schema;
        }
    }
    exports.TaskDefinitionRegistry = new TaskDefinitionRegistryImpl();
});
//# sourceMappingURL=taskDefinitionRegistry.js.map