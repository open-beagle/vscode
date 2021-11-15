/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, nls_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsConfigurationInitialContent = exports.ExtensionsConfigurationSchema = exports.ExtensionsConfigurationSchemaId = void 0;
    exports.ExtensionsConfigurationSchemaId = 'vscode://schemas/extensions';
    exports.ExtensionsConfigurationSchema = {
        id: exports.ExtensionsConfigurationSchemaId,
        allowComments: true,
        allowTrailingCommas: true,
        type: 'object',
        title: (0, nls_1.localize)(0, null),
        additionalProperties: false,
        properties: {
            recommendations: {
                type: 'array',
                description: (0, nls_1.localize)(1, null),
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                    errorMessage: (0, nls_1.localize)(2, null)
                },
            },
            unwantedRecommendations: {
                type: 'array',
                description: (0, nls_1.localize)(3, null),
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                    errorMessage: (0, nls_1.localize)(4, null)
                },
            },
        }
    };
    exports.ExtensionsConfigurationInitialContent = [
        '{',
        '\t// See https://go.microsoft.com/fwlink/?LinkId=827846 to learn about workspace recommendations.',
        '\t// Extension identifier format: ${publisher}.${name}. Example: vscode.csharp',
        '',
        '\t// List of extensions which should be recommended for users of this workspace.',
        '\t"recommendations": [',
        '\t\t',
        '\t],',
        '\t// List of extensions recommended by VS Code that should not be recommended for users of this workspace.',
        '\t"unwantedRecommendations": [',
        '\t\t',
        '\t]',
        '}'
    ].join('\n');
});
//# sourceMappingURL=extensionsFileTemplate.js.map