/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/editor/common/core/position", "vs/editor/common/modes", "vs/platform/contextkey/common/contextkey", "vs/base/common/cancellation", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/base/common/types", "vs/editor/common/services/resolverService"], function (require, exports, errors_1, position_1, modes, contextkey_1, cancellation_1, commands_1, uri_1, types_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.provideSignatureHelp = exports.Context = void 0;
    exports.Context = {
        Visible: new contextkey_1.RawContextKey('parameterHintsVisible', false),
        MultipleSignatures: new contextkey_1.RawContextKey('parameterHintsMultipleSignatures', false),
    };
    async function provideSignatureHelp(model, position, context, token) {
        const supports = modes.SignatureHelpProviderRegistry.ordered(model);
        for (const support of supports) {
            try {
                const result = await support.provideSignatureHelp(model, position, token, context);
                if (result) {
                    return result;
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        }
        return undefined;
    }
    exports.provideSignatureHelp = provideSignatureHelp;
    commands_1.CommandsRegistry.registerCommand('_executeSignatureHelpProvider', async (accessor, ...args) => {
        const [uri, position, triggerCharacter] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(position_1.Position.isIPosition(position));
        (0, types_1.assertType)(typeof triggerCharacter === 'string' || !triggerCharacter);
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const result = await provideSignatureHelp(ref.object.textEditorModel, position_1.Position.lift(position), {
                triggerKind: modes.SignatureHelpTriggerKind.Invoke,
                isRetrigger: false,
                triggerCharacter,
            }, cancellation_1.CancellationToken.None);
            if (!result) {
                return undefined;
            }
            setTimeout(() => result.dispose(), 0);
            return result.value;
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=provideSignatureHelp.js.map