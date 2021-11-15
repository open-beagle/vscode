/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/comments/browser/comments.contribution", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/contrib/comments/browser/commentService", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/comments/browser/commentsEditorContribution"], function (require, exports, nls, extensions_1, platform_1, commentService_1, configurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'comments',
        order: 20,
        title: nls.localize(0, null),
        type: 'object',
        properties: {
            'comments.openPanel': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnSessionStartWithComments'],
                default: 'openOnSessionStartWithComments',
                description: nls.localize(1, null),
                restricted: false
            }
        }
    });
    (0, extensions_1.registerSingleton)(commentService_1.ICommentService, commentService_1.CommentService);
});
//# sourceMappingURL=comments.contribution.js.map