/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/modes", "vs/editor/common/services/modelService", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/semanticTokensDto", "vs/editor/common/core/range"], function (require, exports, cancellation_1, errors_1, uri_1, modes_1, modelService_1, commands_1, types_1, semanticTokensDto_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDocumentRangeSemanticTokensProvider = exports.getDocumentSemanticTokens = exports.isSemanticTokensEdits = exports.isSemanticTokens = void 0;
    function isSemanticTokens(v) {
        return v && !!(v.data);
    }
    exports.isSemanticTokens = isSemanticTokens;
    function isSemanticTokensEdits(v) {
        return v && Array.isArray(v.edits);
    }
    exports.isSemanticTokensEdits = isSemanticTokensEdits;
    function getDocumentSemanticTokens(model, lastResultId, token) {
        const provider = _getDocumentSemanticTokensProvider(model);
        if (!provider) {
            return null;
        }
        return {
            provider: provider,
            request: Promise.resolve(provider.provideDocumentSemanticTokens(model, lastResultId, token))
        };
    }
    exports.getDocumentSemanticTokens = getDocumentSemanticTokens;
    function _getDocumentSemanticTokensProvider(model) {
        const result = modes_1.DocumentSemanticTokensProviderRegistry.ordered(model);
        return (result.length > 0 ? result[0] : null);
    }
    function getDocumentRangeSemanticTokensProvider(model) {
        const result = modes_1.DocumentRangeSemanticTokensProviderRegistry.ordered(model);
        return (result.length > 0 ? result[0] : null);
    }
    exports.getDocumentRangeSemanticTokensProvider = getDocumentRangeSemanticTokensProvider;
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokensLegend', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const provider = _getDocumentSemanticTokensProvider(model);
        if (!provider) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokensLegend', uri);
        }
        return provider.getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokens', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const r = getDocumentSemanticTokens(model, null, cancellation_1.CancellationToken.None);
        if (!r) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokens', uri, model.getFullModelRange());
        }
        const { provider, request } = r;
        let result;
        try {
            result = await request;
        }
        catch (err) {
            (0, errors_1.onUnexpectedExternalError)(err);
            return undefined;
        }
        if (!result || !isSemanticTokens(result)) {
            return undefined;
        }
        const buff = (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: result.data
        });
        if (result.resultId) {
            provider.releaseDocumentSemanticTokens(result.resultId);
        }
        return buff;
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokensLegend', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const provider = getDocumentRangeSemanticTokensProvider(model);
        if (!provider) {
            return undefined;
        }
        return provider.getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokens', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const provider = getDocumentRangeSemanticTokensProvider(model);
        if (!provider) {
            // there is no provider
            return undefined;
        }
        let result;
        try {
            result = await provider.provideDocumentRangeSemanticTokens(model, range_1.Range.lift(range), cancellation_1.CancellationToken.None);
        }
        catch (err) {
            (0, errors_1.onUnexpectedExternalError)(err);
            return undefined;
        }
        if (!result || !isSemanticTokens(result)) {
            return undefined;
        }
        return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: result.data
        });
    });
});
//# sourceMappingURL=getSemanticTokens.js.map