/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeActions/common/documentationExtensionPoint", "vs/workbench/services/mode/common/workbenchModeService"], function (require, exports, nls, workbenchModeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.documentationExtensionPointDescriptor = exports.DocumentationExtensionPointFields = void 0;
    var DocumentationExtensionPointFields;
    (function (DocumentationExtensionPointFields) {
        DocumentationExtensionPointFields["when"] = "when";
        DocumentationExtensionPointFields["title"] = "title";
        DocumentationExtensionPointFields["command"] = "command";
    })(DocumentationExtensionPointFields = exports.DocumentationExtensionPointFields || (exports.DocumentationExtensionPointFields = {}));
    const documentationExtensionPointSchema = Object.freeze({
        type: 'object',
        description: nls.localize(0, null),
        properties: {
            'refactoring': {
                type: 'array',
                description: nls.localize(1, null),
                items: {
                    type: 'object',
                    description: nls.localize(2, null),
                    required: [
                        DocumentationExtensionPointFields.title,
                        DocumentationExtensionPointFields.when,
                        DocumentationExtensionPointFields.command
                    ],
                    properties: {
                        [DocumentationExtensionPointFields.title]: {
                            type: 'string',
                            description: nls.localize(3, null),
                        },
                        [DocumentationExtensionPointFields.when]: {
                            type: 'string',
                            description: nls.localize(4, null),
                        },
                        [DocumentationExtensionPointFields.command]: {
                            type: 'string',
                            description: nls.localize(5, null),
                        },
                    },
                }
            }
        }
    });
    exports.documentationExtensionPointDescriptor = {
        extensionPoint: 'documentation',
        deps: [workbenchModeService_1.languagesExtPoint],
        jsonSchema: documentationExtensionPointSchema
    };
});
//# sourceMappingURL=documentationExtensionPoint.js.map