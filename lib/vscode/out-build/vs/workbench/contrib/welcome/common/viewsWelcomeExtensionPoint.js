/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/common/viewsWelcomeExtensionPoint"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewsWelcomeExtensionPointDescriptor = exports.ViewIdentifierMap = exports.ViewsWelcomeExtensionPointFields = void 0;
    var ViewsWelcomeExtensionPointFields;
    (function (ViewsWelcomeExtensionPointFields) {
        ViewsWelcomeExtensionPointFields["view"] = "view";
        ViewsWelcomeExtensionPointFields["contents"] = "contents";
        ViewsWelcomeExtensionPointFields["when"] = "when";
        ViewsWelcomeExtensionPointFields["group"] = "group";
        ViewsWelcomeExtensionPointFields["enablement"] = "enablement";
    })(ViewsWelcomeExtensionPointFields = exports.ViewsWelcomeExtensionPointFields || (exports.ViewsWelcomeExtensionPointFields = {}));
    exports.ViewIdentifierMap = {
        'explorer': 'workbench.explorer.emptyView',
        'debug': 'workbench.debug.welcome',
        'scm': 'workbench.scm',
        'testing': 'workbench.view.testing'
    };
    const viewsWelcomeExtensionPointSchema = Object.freeze({
        type: 'array',
        description: nls.localize(0, null),
        items: {
            type: 'object',
            description: nls.localize(1, null),
            required: [
                ViewsWelcomeExtensionPointFields.view,
                ViewsWelcomeExtensionPointFields.contents
            ],
            properties: {
                [ViewsWelcomeExtensionPointFields.view]: {
                    anyOf: [
                        {
                            type: 'string',
                            description: nls.localize(2, null)
                        },
                        {
                            type: 'string',
                            description: nls.localize(3, null),
                            enum: Object.keys(exports.ViewIdentifierMap)
                        }
                    ]
                },
                [ViewsWelcomeExtensionPointFields.contents]: {
                    type: 'string',
                    description: nls.localize(4, null),
                },
                [ViewsWelcomeExtensionPointFields.when]: {
                    type: 'string',
                    description: nls.localize(5, null),
                },
                [ViewsWelcomeExtensionPointFields.group]: {
                    type: 'string',
                    description: nls.localize(6, null),
                },
                [ViewsWelcomeExtensionPointFields.enablement]: {
                    type: 'string',
                    description: nls.localize(7, null),
                },
            }
        }
    });
    exports.viewsWelcomeExtensionPointDescriptor = {
        extensionPoint: 'viewsWelcome',
        jsonSchema: viewsWelcomeExtensionPointSchema
    };
});
//# sourceMappingURL=viewsWelcomeExtensionPoint.js.map