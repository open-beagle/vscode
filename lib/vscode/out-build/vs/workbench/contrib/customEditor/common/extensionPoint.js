/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/customEditor/common/extensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/mode/common/workbenchModeService"], function (require, exports, nls, extensionsRegistry_1, workbenchModeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.customEditorsExtensionPoint = void 0;
    var Fields;
    (function (Fields) {
        Fields.viewType = 'viewType';
        Fields.displayName = 'displayName';
        Fields.selector = 'selector';
        Fields.priority = 'priority';
    })(Fields || (Fields = {}));
    const CustomEditorsContribution = {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{
                body: [{
                        [Fields.viewType]: '$1',
                        [Fields.displayName]: '$2',
                        [Fields.selector]: [{
                                filenamePattern: '$3'
                            }],
                    }]
            }],
        items: {
            type: 'object',
            required: [
                Fields.viewType,
                Fields.displayName,
                Fields.selector,
            ],
            properties: {
                [Fields.viewType]: {
                    type: 'string',
                    markdownDescription: nls.localize(1, null),
                },
                [Fields.displayName]: {
                    type: 'string',
                    description: nls.localize(2, null),
                },
                [Fields.selector]: {
                    type: 'array',
                    description: nls.localize(3, null),
                    items: {
                        type: 'object',
                        defaultSnippets: [{
                                body: {
                                    filenamePattern: '$1',
                                }
                            }],
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize(4, null),
                            },
                        }
                    }
                },
                [Fields.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize(5, null),
                    enum: [
                        "default" /* default */,
                        "option" /* option */,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize(6, null),
                        nls.localize(7, null),
                    ],
                    default: 'default'
                }
            }
        }
    };
    exports.customEditorsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'customEditors',
        deps: [workbenchModeService_1.languagesExtPoint],
        jsonSchema: CustomEditorsContribution
    });
});
//# sourceMappingURL=extensionPoint.js.map