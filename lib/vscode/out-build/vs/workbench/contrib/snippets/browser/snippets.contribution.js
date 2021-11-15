/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/nls!vs/workbench/contrib/snippets/browser/snippets.contribution", "vs/platform/instantiation/common/instantiation"], function (require, exports, platform_1, JSONContributionRegistry, nls, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISnippetsService = void 0;
    exports.ISnippetsService = (0, instantiation_1.createDecorator)('snippetService');
    const languageScopeSchemaId = 'vscode://schemas/snippets';
    const snippetSchemaProperties = {
        prefix: {
            description: nls.localize(0, null),
            type: ['string', 'array']
        },
        body: {
            markdownDescription: nls.localize(1, null),
            type: ['string', 'array'],
            items: {
                type: 'string'
            }
        },
        description: {
            description: nls.localize(2, null),
            type: ['string', 'array']
        }
    };
    const languageScopeSchema = {
        id: languageScopeSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        defaultSnippets: [{
                label: nls.localize(3, null),
                body: { '${1:snippetName}': { 'prefix': '${2:prefix}', 'body': '${3:snippet}', 'description': '${4:description}' } }
            }],
        type: 'object',
        description: nls.localize(4, null),
        additionalProperties: {
            type: 'object',
            required: ['body'],
            properties: snippetSchemaProperties,
            additionalProperties: false
        }
    };
    const globalSchemaId = 'vscode://schemas/global-snippets';
    const globalSchema = {
        id: globalSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        defaultSnippets: [{
                label: nls.localize(5, null),
                body: { '${1:snippetName}': { 'scope': '${2:scope}', 'prefix': '${3:prefix}', 'body': '${4:snippet}', 'description': '${5:description}' } }
            }],
        type: 'object',
        description: nls.localize(6, null),
        additionalProperties: {
            type: 'object',
            required: ['body'],
            properties: Object.assign(Object.assign({}, snippetSchemaProperties), { scope: {
                    description: nls.localize(7, null),
                    type: 'string'
                } }),
            additionalProperties: false
        }
    };
    const reg = platform_1.Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
    reg.registerSchema(languageScopeSchemaId, languageScopeSchema);
    reg.registerSchema(globalSchemaId, globalSchema);
});
//# sourceMappingURL=snippets.contribution.js.map