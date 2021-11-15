/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/jsonValidationExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/resources", "vs/base/common/types"], function (require, exports, nls, extensionsRegistry_1, resources, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONValidationExtensionPoint = void 0;
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'jsonValidation',
        defaultExtensionKind: 'workspace',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            defaultSnippets: [{ body: [{ fileMatch: '${1:file.json}', url: '${2:url}' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { fileMatch: '${1:file.json}', url: '${2:url}' } }],
                properties: {
                    fileMatch: {
                        type: ['string', 'array'],
                        description: nls.localize(1, null),
                        items: {
                            type: ['string']
                        }
                    },
                    url: {
                        description: nls.localize(2, null),
                        type: 'string'
                    }
                }
            }
        }
    });
    class JSONValidationExtensionPoint {
        constructor() {
            configurationExtPoint.setHandler((extensions) => {
                for (const extension of extensions) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    const extensionLocation = extension.description.extensionLocation;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(3, null));
                        return;
                    }
                    extensionValue.forEach(extension => {
                        if (!(0, types_1.isString)(extension.fileMatch) && !(Array.isArray(extension.fileMatch) && extension.fileMatch.every(types_1.isString))) {
                            collector.error(nls.localize(4, null));
                            return;
                        }
                        let uri = extension.url;
                        if (!(0, types_1.isString)(uri)) {
                            collector.error(nls.localize(5, null));
                            return;
                        }
                        if (uri.startsWith('./')) {
                            try {
                                const colorThemeLocation = resources.joinPath(extensionLocation, uri);
                                if (!resources.isEqualOrParent(colorThemeLocation, extensionLocation)) {
                                    collector.warn(nls.localize(6, null, configurationExtPoint.name, colorThemeLocation.toString(), extensionLocation.path));
                                }
                            }
                            catch (e) {
                                collector.error(nls.localize(7, null, e.message));
                            }
                        }
                        else if (!/^[^:/?#]+:\/\//.test(uri)) {
                            collector.error(nls.localize(8, null));
                            return;
                        }
                    });
                }
            });
        }
    }
    exports.JSONValidationExtensionPoint = JSONValidationExtensionPoint;
});
//# sourceMappingURL=jsonValidationExtensionPoint.js.map