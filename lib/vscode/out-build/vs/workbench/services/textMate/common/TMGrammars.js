/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/textMate/common/TMGrammars", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/mode/common/workbenchModeService"], function (require, exports, nls, extensionsRegistry_1, workbenchModeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.grammarsExtPoint = void 0;
    exports.grammarsExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'grammars',
        deps: [workbenchModeService_1.languagesExtPoint],
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', scopeName: 'source.${2:id}', path: './syntaxes/${3:id}.tmLanguage.' } }],
                properties: {
                    language: {
                        description: nls.localize(1, null),
                        type: 'string'
                    },
                    scopeName: {
                        description: nls.localize(2, null),
                        type: 'string'
                    },
                    path: {
                        description: nls.localize(3, null),
                        type: 'string'
                    },
                    embeddedLanguages: {
                        description: nls.localize(4, null),
                        type: 'object'
                    },
                    tokenTypes: {
                        description: nls.localize(5, null),
                        type: 'object',
                        additionalProperties: {
                            enum: ['string', 'comment', 'other']
                        }
                    },
                    injectTo: {
                        description: nls.localize(6, null),
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                },
                required: ['scopeName', 'path']
            }
        }
    });
});
//# sourceMappingURL=TMGrammars.js.map