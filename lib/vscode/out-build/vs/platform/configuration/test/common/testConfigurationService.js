/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/base/common/event"], function (require, exports, map_1, configuration_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestConfigurationService = void 0;
    class TestConfigurationService {
        constructor(configuration) {
            this.onDidChangeConfiguration = new event_1.Emitter().event;
            this.configurationByRoot = map_1.TernarySearchTree.forPaths();
            this.configuration = configuration || Object.create(null);
        }
        reloadConfiguration() {
            return Promise.resolve(this.getValue());
        }
        getValue(arg1, arg2) {
            let configuration;
            const overrides = (0, configuration_1.isConfigurationOverrides)(arg1) ? arg1 : (0, configuration_1.isConfigurationOverrides)(arg2) ? arg2 : undefined;
            if (overrides) {
                if (overrides.resource) {
                    configuration = this.configurationByRoot.findSubstr(overrides.resource.fsPath);
                }
            }
            configuration = configuration ? configuration : this.configuration;
            if (arg1 && typeof arg1 === 'string') {
                return (0, configuration_1.getConfigurationValue)(configuration, arg1);
            }
            return configuration;
        }
        updateValue(key, value) {
            return Promise.resolve(undefined);
        }
        setUserConfiguration(key, value, root) {
            if (root) {
                const configForRoot = this.configurationByRoot.get(root.fsPath) || Object.create(null);
                configForRoot[key] = value;
                this.configurationByRoot.set(root.fsPath, configForRoot);
            }
            else {
                this.configuration[key] = value;
            }
            return Promise.resolve(undefined);
        }
        inspect(key, overrides) {
            const config = this.getValue(undefined, overrides);
            return {
                value: (0, configuration_1.getConfigurationValue)(config, key),
                defaultValue: (0, configuration_1.getConfigurationValue)(config, key),
                userValue: (0, configuration_1.getConfigurationValue)(config, key)
            };
        }
        keys() {
            return {
                default: (0, configuration_1.getConfigurationKeys)(),
                user: Object.keys(this.configuration),
                workspace: [],
                workspaceFolder: []
            };
        }
        getConfigurationData() {
            return null;
        }
    }
    exports.TestConfigurationService = TestConfigurationService;
});
//# sourceMappingURL=testConfigurationService.js.map