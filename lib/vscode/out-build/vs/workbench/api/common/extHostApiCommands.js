/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/editor/common/modes", "vs/workbench/api/common/extHostCommands", "./apiCommands", "vs/base/common/arrays", "vs/editor/common/services/semanticTokensDto"], function (require, exports, lifecycle_1, typeConverters, types, modes, extHostCommands_1, apiCommands_1, arrays_1, semanticTokensDto_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostApiCommands = void 0;
    //#region --- NEW world
    const newCommands = [
        // -- document highlights
        new extHostCommands_1.ApiCommand('vscode.executeDocumentHighlights', '_executeDocumentHighlights', 'Execute document highlight provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of DocumentHighlight-instances.', tryMapWith(typeConverters.DocumentHighlight.to))),
        // -- document symbols
        new extHostCommands_1.ApiCommand('vscode.executeDocumentSymbolProvider', '_executeDocumentSymbolProvider', 'Execute document symbol provider.', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.', (value, apiArgs) => {
            if ((0, arrays_1.isFalsyOrEmpty)(value)) {
                return undefined;
            }
            class MergedInfo extends types.SymbolInformation {
                static to(symbol) {
                    const res = new MergedInfo(symbol.name, typeConverters.SymbolKind.to(symbol.kind), symbol.containerName || '', new types.Location(apiArgs[0], typeConverters.Range.to(symbol.range)));
                    res.detail = symbol.detail;
                    res.range = res.location.range;
                    res.selectionRange = typeConverters.Range.to(symbol.selectionRange);
                    res.children = symbol.children ? symbol.children.map(MergedInfo.to) : [];
                    return res;
                }
            }
            return value.map(MergedInfo.to);
        })),
        // -- formatting
        new extHostCommands_1.ApiCommand('vscode.executeFormatDocumentProvider', '_executeFormatDocumentProvider', 'Execute document format provider.', [extHostCommands_1.ApiCommandArgument.Uri, new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.ApiCommand('vscode.executeFormatRangeProvider', '_executeFormatRangeProvider', 'Execute range format provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range, new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        new extHostCommands_1.ApiCommand('vscode.executeFormatOnTypeProvider', '_executeFormatOnTypeProvider', 'Execute format on type provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, new extHostCommands_1.ApiCommandArgument('ch', 'Trigger character', v => typeof v === 'string', v => v), new extHostCommands_1.ApiCommandArgument('options', 'Formatting options', _ => true, v => v)], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of TextEdits.', tryMapWith(typeConverters.TextEdit.to))),
        // -- go to symbol (definition, type definition, declaration, impl, references)
        new extHostCommands_1.ApiCommand('vscode.executeDefinitionProvider', '_executeDefinitionProvider', 'Execute all definition providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeTypeDefinitionProvider', '_executeTypeDefinitionProvider', 'Execute all type definition providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeDeclarationProvider', '_executeDeclarationProvider', 'Execute all declaration providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeImplementationProvider', '_executeImplementationProvider', 'Execute all implementation providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location or LocationLink instances.', mapLocationOrLocationLink)),
        new extHostCommands_1.ApiCommand('vscode.executeReferenceProvider', '_executeReferenceProvider', 'Execute all reference providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Location-instances.', tryMapWith(typeConverters.location.to))),
        // -- hover
        new extHostCommands_1.ApiCommand('vscode.executeHoverProvider', '_executeHoverProvider', 'Execute all hover providers.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Hover-instances.', tryMapWith(typeConverters.Hover.to))),
        // -- selection range
        new extHostCommands_1.ApiCommand('vscode.executeSelectionRangeProvider', '_executeSelectionRangeProvider', 'Execute selection range provider.', [extHostCommands_1.ApiCommandArgument.Uri, new extHostCommands_1.ApiCommandArgument('position', 'A position in a text document', v => Array.isArray(v) && v.every(v => types.Position.isPosition(v)), v => v.map(typeConverters.Position.from))], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ranges.', result => {
            return result.map(ranges => {
                let node;
                for (const range of ranges.reverse()) {
                    node = new types.SelectionRange(typeConverters.Range.to(range), node);
                }
                return node;
            });
        })),
        // -- symbol search
        new extHostCommands_1.ApiCommand('vscode.executeWorkspaceSymbolProvider', '_executeWorkspaceSymbolProvider', 'Execute all workspace symbol providers.', [extHostCommands_1.ApiCommandArgument.String.with('query', 'Search string')], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of SymbolInformation-instances.', value => {
            const result = [];
            if (Array.isArray(value)) {
                for (let tuple of value) {
                    result.push(...tuple[1].map(typeConverters.WorkspaceSymbol.to));
                }
            }
            return result;
        })),
        // --- call hierarchy
        new extHostCommands_1.ApiCommand('vscode.prepareCallHierarchy', '_executePrepareCallHierarchy', 'Prepare call hierarchy at a position inside a document', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position], new extHostCommands_1.ApiCommandResult('A CallHierarchyItem or undefined', v => v.map(typeConverters.CallHierarchyItem.to))),
        new extHostCommands_1.ApiCommand('vscode.provideIncomingCalls', '_executeProvideIncomingCalls', 'Compute incoming calls for an item', [extHostCommands_1.ApiCommandArgument.CallHierarchyItem], new extHostCommands_1.ApiCommandResult('A CallHierarchyItem or undefined', v => v.map(typeConverters.CallHierarchyIncomingCall.to))),
        new extHostCommands_1.ApiCommand('vscode.provideOutgoingCalls', '_executeProvideOutgoingCalls', 'Compute outgoing calls for an item', [extHostCommands_1.ApiCommandArgument.CallHierarchyItem], new extHostCommands_1.ApiCommandResult('A CallHierarchyItem or undefined', v => v.map(typeConverters.CallHierarchyOutgoingCall.to))),
        // --- rename
        new extHostCommands_1.ApiCommand('vscode.executeDocumentRenameProvider', '_executeDocumentRenameProvider', 'Execute rename provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, extHostCommands_1.ApiCommandArgument.String.with('newName', 'The new symbol name')], new extHostCommands_1.ApiCommandResult('A promise that resolves to a WorkspaceEdit.', value => {
            if (!value) {
                return undefined;
            }
            if (value.rejectReason) {
                throw new Error(value.rejectReason);
            }
            return typeConverters.WorkspaceEdit.to(value);
        })),
        // --- links
        new extHostCommands_1.ApiCommand('vscode.executeLinkProvider', '_executeLinkProvider', 'Execute document link provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Number.with('linkResolveCount', 'Number of links that should be resolved, only when links are unresolved.').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of DocumentLink-instances.', value => value.map(typeConverters.DocumentLink.to))),
        // --- semantic tokens
        new extHostCommands_1.ApiCommand('vscode.provideDocumentSemanticTokensLegend', '_provideDocumentSemanticTokensLegend', 'Provide semantic tokens legend for a document', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentSemanticTokens', '_provideDocumentSemanticTokens', 'Provide semantic tokens for a document', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentSemanticTokens
                return undefined;
            }
            return new types.SemanticTokens(semanticTokensDto.data, undefined);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentRangeSemanticTokensLegend', '_provideDocumentRangeSemanticTokensLegend', 'Provide semantic tokens legend for a document range', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokensLegend.', value => {
            if (!value) {
                return undefined;
            }
            return new types.SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
        })),
        new extHostCommands_1.ApiCommand('vscode.provideDocumentRangeSemanticTokens', '_provideDocumentRangeSemanticTokens', 'Provide semantic tokens for a document range', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range], new extHostCommands_1.ApiCommandResult('A promise that resolves to SemanticTokens.', value => {
            if (!value) {
                return undefined;
            }
            const semanticTokensDto = (0, semanticTokensDto_1.decodeSemanticTokensDto)(value);
            if (semanticTokensDto.type !== 'full') {
                // only accepting full semantic tokens from provideDocumentRangeSemanticTokens
                return undefined;
            }
            return new types.SemanticTokens(semanticTokensDto.data, undefined);
        })),
        // --- completions
        new extHostCommands_1.ApiCommand('vscode.executeCompletionItemProvider', '_executeCompletionItemProvider', 'Execute completion item provider.', [
            extHostCommands_1.ApiCommandArgument.Uri,
            extHostCommands_1.ApiCommandArgument.Position,
            extHostCommands_1.ApiCommandArgument.String.with('triggerCharacter', 'Trigger completion when the user types the character, like `,` or `(`').optional(),
            extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of completions to resolve (too large numbers slow down completions)').optional()
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to a CompletionList-instance.', (value, _args, converter) => {
            if (!value) {
                return new types.CompletionList([]);
            }
            const items = value.suggestions.map(suggestion => typeConverters.CompletionItem.to(suggestion, converter));
            return new types.CompletionList(items, value.incomplete);
        })),
        // --- signature help
        new extHostCommands_1.ApiCommand('vscode.executeSignatureHelpProvider', '_executeSignatureHelpProvider', 'Execute signature help provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Position, extHostCommands_1.ApiCommandArgument.String.with('triggerCharacter', 'Trigger signature help when the user types the character, like `,` or `(`').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to SignatureHelp.', value => {
            if (value) {
                return typeConverters.SignatureHelp.to(value);
            }
            return undefined;
        })),
        // --- code lens
        new extHostCommands_1.ApiCommand('vscode.executeCodeLensProvider', '_executeCodeLensProvider', 'Execute code lens provider.', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)').optional()], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of CodeLens-instances.', (value, _args, converter) => {
            return tryMapWith(item => {
                return new types.CodeLens(typeConverters.Range.to(item.range), item.command && converter.fromInternal(item.command));
            })(value);
        })),
        // --- code actions
        new extHostCommands_1.ApiCommand('vscode.executeCodeActionProvider', '_executeCodeActionProvider', 'Execute code action provider.', [
            extHostCommands_1.ApiCommandArgument.Uri,
            new extHostCommands_1.ApiCommandArgument('rangeOrSelection', 'Range in a text document. Some refactoring provider requires Selection object.', v => types.Range.isRange(v), v => types.Selection.isSelection(v) ? typeConverters.Selection.from(v) : typeConverters.Range.from(v)),
            extHostCommands_1.ApiCommandArgument.String.with('kind', 'Code action kind to return code actions for').optional(),
            extHostCommands_1.ApiCommandArgument.Number.with('itemResolveCount', 'Number of code actions to resolve (too large numbers slow down code actions)').optional()
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of Command-instances.', (value, _args, converter) => {
            return tryMapWith((codeAction) => {
                if (codeAction._isSynthetic) {
                    if (!codeAction.command) {
                        throw new Error('Synthetic code actions must have a command');
                    }
                    return converter.fromInternal(codeAction.command);
                }
                else {
                    const ret = new types.CodeAction(codeAction.title, codeAction.kind ? new types.CodeActionKind(codeAction.kind) : undefined);
                    if (codeAction.edit) {
                        ret.edit = typeConverters.WorkspaceEdit.to(codeAction.edit);
                    }
                    if (codeAction.command) {
                        ret.command = converter.fromInternal(codeAction.command);
                    }
                    ret.isPreferred = codeAction.isPreferred;
                    return ret;
                }
            })(value);
        })),
        // --- colors
        new extHostCommands_1.ApiCommand('vscode.executeDocumentColorProvider', '_executeDocumentColorProvider', 'Execute document color provider.', [extHostCommands_1.ApiCommandArgument.Uri], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ColorInformation objects.', result => {
            if (result) {
                return result.map(ci => new types.ColorInformation(typeConverters.Range.to(ci.range), typeConverters.Color.to(ci.color)));
            }
            return [];
        })),
        new extHostCommands_1.ApiCommand('vscode.executeColorPresentationProvider', '_executeColorPresentationProvider', 'Execute color presentation provider.', [
            new extHostCommands_1.ApiCommandArgument('color', 'The color to show and insert', v => v instanceof types.Color, typeConverters.Color.from),
            new extHostCommands_1.ApiCommandArgument('context', 'Context object with uri and range', _v => true, v => ({ uri: v.uri, range: typeConverters.Range.from(v.range) })),
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of ColorPresentation objects.', result => {
            if (result) {
                return result.map(typeConverters.ColorPresentation.to);
            }
            return [];
        })),
        // --- inline hints
        new extHostCommands_1.ApiCommand('vscode.executeInlineHintProvider', '_executeInlineHintProvider', 'Execute inline hints provider', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of InlineHint objects', result => {
            return result.map(typeConverters.InlineHint.to);
        })),
        // --- notebooks
        new extHostCommands_1.ApiCommand('vscode.resolveNotebookContentProviders', '_resolveNotebookContentProvider', 'Resolve Notebook Content Providers', [
        // new ApiCommandArgument<string, string>('viewType', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<string, string>('displayName', '', v => typeof v === 'string', v => v),
        // new ApiCommandArgument<object, object>('options', '', v => typeof v === 'object', v => v),
        ], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of NotebookContentProvider static info objects.', tryMapWith(item => {
            return {
                viewType: item.viewType,
                displayName: item.displayName,
                options: {
                    transientOutputs: item.options.transientOutputs,
                    transientCellMetadata: item.options.transientCellMetadata,
                    transientDocumentMetadata: item.options.transientDocumentMetadata
                },
                filenamePattern: item.filenamePattern.map(pattern => typeConverters.NotebookExclusiveDocumentPattern.to(pattern))
            };
        }))),
        // --- debug support
        new extHostCommands_1.ApiCommand('vscode.executeInlineValueProvider', '_executeInlineValueProvider', 'Execute inline value provider', [extHostCommands_1.ApiCommandArgument.Uri, extHostCommands_1.ApiCommandArgument.Range], new extHostCommands_1.ApiCommandResult('A promise that resolves to an array of InlineValue objects', result => {
            return result.map(typeConverters.InlineValue.to);
        })),
        // --- open'ish commands
        new extHostCommands_1.ApiCommand('vscode.open', '_workbench.open', 'Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.', [
            extHostCommands_1.ApiCommandArgument.Uri,
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [v, undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
            extHostCommands_1.ApiCommandArgument.String.with('label', '').optional()
        ], extHostCommands_1.ApiCommandResult.Void),
        new extHostCommands_1.ApiCommand('vscode.openWith', '_workbench.openWith', 'Opens the provided resource with a specific editor.', [
            extHostCommands_1.ApiCommandArgument.Uri.with('resource', 'Resource to open'),
            extHostCommands_1.ApiCommandArgument.String.with('viewId', 'Custom editor view id or \'default\' to use VS Code\'s default editor'),
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'number' || typeof v === 'object', v => !v ? v : typeof v === 'number' ? [v, undefined] : [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional()
        ], extHostCommands_1.ApiCommandResult.Void),
        new extHostCommands_1.ApiCommand('vscode.diff', '_workbench.diff', 'Opens the provided resources in the diff editor to compare their contents.', [
            extHostCommands_1.ApiCommandArgument.Uri.with('left', 'Left-hand side resource of the diff editor'),
            extHostCommands_1.ApiCommandArgument.Uri.with('right', 'Right-hand side resource of the diff editor'),
            extHostCommands_1.ApiCommandArgument.String.with('title', 'Human readable title for the diff editor').optional(),
            new extHostCommands_1.ApiCommandArgument('columnOrOptions', 'Either the column in which to open or editor options, see vscode.TextDocumentShowOptions', v => v === undefined || typeof v === 'object', v => v && [typeConverters.ViewColumn.from(v.viewColumn), typeConverters.TextEditorOpenOptions.from(v)]).optional(),
        ], extHostCommands_1.ApiCommandResult.Void),
    ];
    //#endregion
    //#region OLD world
    class ExtHostApiCommands {
        constructor(commands) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._commands = commands;
        }
        static register(commands) {
            newCommands.forEach(commands.registerApiCommand, commands);
            return new ExtHostApiCommands(commands).registerCommands();
        }
        registerCommands() {
            // -----------------------------------------------------------------
            // The following commands are registered on both sides separately.
            //
            // We are trying to maintain backwards compatibility for cases where
            // API commands are encoded as markdown links, for example.
            // -----------------------------------------------------------------
            const adjustHandler = (handler) => {
                return (...args) => {
                    return handler(this._commands, ...args);
                };
            };
            this._register(apiCommands_1.RemoveFromRecentlyOpenedAPICommand.ID, adjustHandler(apiCommands_1.RemoveFromRecentlyOpenedAPICommand.execute), {
                description: 'Removes an entry with the given path from the recently opened list.',
                args: [
                    { name: 'path', description: 'Path to remove from recently opened.', constraint: (value) => typeof value === 'string' }
                ]
            });
            this._register(apiCommands_1.OpenIssueReporter.ID, adjustHandler(apiCommands_1.OpenIssueReporter.execute), {
                description: 'Opens the issue reporter with the provided extension id as the selected source',
                args: [
                    { name: 'extensionId', description: 'extensionId to report an issue on', constraint: (value) => typeof value === 'string' || (typeof value === 'object' && typeof value.extensionId === 'string') }
                ]
            });
        }
        // --- command impl
        /**
         * @deprecated use the ApiCommand instead
         */
        _register(id, handler, description) {
            const disposable = this._commands.registerCommand(false, id, handler, this, description);
            this._disposables.add(disposable);
        }
    }
    exports.ExtHostApiCommands = ExtHostApiCommands;
    function tryMapWith(f) {
        return (value) => {
            if (Array.isArray(value)) {
                return value.map(f);
            }
            return undefined;
        };
    }
    function mapLocationOrLocationLink(values) {
        if (!Array.isArray(values)) {
            return undefined;
        }
        const result = [];
        for (const item of values) {
            if (modes.isLocationLink(item)) {
                result.push(typeConverters.DefinitionLink.to(item));
            }
            else {
                result.push(typeConverters.location.to(item));
            }
        }
        return result;
    }
});
//# sourceMappingURL=extHostApiCommands.js.map