/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint", "vs/workbench/services/mode/common/workbenchModeService"], function (require, exports, nls, workbenchModeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.codeActionsExtensionPointDescriptor = exports.CodeActionExtensionPointFields = void 0;
    var CodeActionExtensionPointFields;
    (function (CodeActionExtensionPointFields) {
        CodeActionExtensionPointFields["languages"] = "languages";
        CodeActionExtensionPointFields["actions"] = "actions";
        CodeActionExtensionPointFields["kind"] = "kind";
        CodeActionExtensionPointFields["title"] = "title";
        CodeActionExtensionPointFields["description"] = "description";
    })(CodeActionExtensionPointFields = exports.CodeActionExtensionPointFields || (exports.CodeActionExtensionPointFields = {}));
    const codeActionsExtensionPointSchema = Object.freeze({
        type: 'array',
        markdownDescription: nls.localize(0, null),
        items: {
            type: 'object',
            required: [CodeActionExtensionPointFields.languages, CodeActionExtensionPointFields.actions],
            properties: {
                [CodeActionExtensionPointFields.languages]: {
                    type: 'array',
                    description: nls.localize(1, null),
                    items: { type: 'string' }
                },
                [CodeActionExtensionPointFields.actions]: {
                    type: 'object',
                    required: [CodeActionExtensionPointFields.kind, CodeActionExtensionPointFields.title],
                    properties: {
                        [CodeActionExtensionPointFields.kind]: {
                            type: 'string',
                            markdownDescription: nls.localize(2, null),
                        },
                        [CodeActionExtensionPointFields.title]: {
                            type: 'string',
                            description: nls.localize(3, null),
                        },
                        [CodeActionExtensionPointFields.description]: {
                            type: 'string',
                            description: nls.localize(4, null),
                        },
                    }
                }
            }
        }
    });
    exports.codeActionsExtensionPointDescriptor = {
        extensionPoint: 'codeActions',
        deps: [workbenchModeService_1.languagesExtPoint],
        jsonSchema: codeActionsExtensionPointSchema
    };
});
//# sourceMappingURL=codeActionsExtensionPoint.js.map