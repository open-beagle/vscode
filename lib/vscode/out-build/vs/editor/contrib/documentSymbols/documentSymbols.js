/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/base/common/cancellation", "vs/editor/common/services/resolverService", "vs/editor/contrib/documentSymbols/outlineModel", "vs/platform/commands/common/commands", "vs/base/common/types"], function (require, exports, uri_1, modelService_1, cancellation_1, resolverService_1, outlineModel_1, commands_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDocumentSymbols = void 0;
    async function getDocumentSymbols(document, flat, token) {
        const model = await outlineModel_1.OutlineModel.create(document, token);
        return flat
            ? model.asListOfDocumentSymbols()
            : model.getTopLevelSymbols();
    }
    exports.getDocumentSymbols = getDocumentSymbols;
    commands_1.CommandsRegistry.registerCommand('_executeDocumentSymbolProvider', async function (accessor, ...args) {
        const [resource] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(resource));
        const model = accessor.get(modelService_1.IModelService).getModel(resource);
        if (model) {
            return getDocumentSymbols(model, false, cancellation_1.CancellationToken.None);
        }
        const reference = await accessor.get(resolverService_1.ITextModelService).createModelReference(resource);
        try {
            return await getDocumentSymbols(reference.object.textEditorModel, false, cancellation_1.CancellationToken.None);
        }
        finally {
            reference.dispose();
        }
    });
});
//# sourceMappingURL=documentSymbols.js.map