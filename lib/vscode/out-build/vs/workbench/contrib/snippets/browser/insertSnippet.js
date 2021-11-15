/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/snippets/browser/insertSnippet", "vs/editor/browser/editorExtensions", "vs/editor/common/services/modeService", "vs/platform/commands/common/commands", "vs/workbench/contrib/snippets/browser/snippets.contribution", "vs/editor/contrib/snippet/snippetController2", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/platform/quickinput/common/quickInput", "vs/platform/clipboard/common/clipboardService", "vs/base/common/codicons", "vs/base/common/event"], function (require, exports, nls, editorExtensions_1, modeService_1, commands_1, snippets_contribution_1, snippetController2_1, editorContextKeys_1, snippetsFile_1, quickInput_1, clipboardService_1, codicons_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Args {
        constructor(snippet, name, langId) {
            this.snippet = snippet;
            this.name = name;
            this.langId = langId;
        }
        static fromUser(arg) {
            if (!arg || typeof arg !== 'object') {
                return Args._empty;
            }
            let { snippet, name, langId } = arg;
            if (typeof snippet !== 'string') {
                snippet = undefined;
            }
            if (typeof name !== 'string') {
                name = undefined;
            }
            if (typeof langId !== 'string') {
                langId = undefined;
            }
            return new Args(snippet, name, langId);
        }
    }
    Args._empty = new Args(undefined, undefined, undefined);
    class InsertSnippetAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.insertSnippet',
                label: nls.localize(0, null),
                alias: 'Insert Snippet',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                description: {
                    description: `Insert Snippet`,
                    args: [{
                            name: 'args',
                            schema: {
                                'type': 'object',
                                'properties': {
                                    'snippet': {
                                        'type': 'string'
                                    },
                                    'langId': {
                                        'type': 'string',
                                    },
                                    'name': {
                                        'type': 'string'
                                    }
                                },
                            }
                        }]
                }
            });
        }
        async run(accessor, editor, arg) {
            const modeService = accessor.get(modeService_1.IModeService);
            const snippetService = accessor.get(snippets_contribution_1.ISnippetsService);
            if (!editor.hasModel()) {
                return;
            }
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const snippet = await new Promise(async (resolve) => {
                const { lineNumber, column } = editor.getPosition();
                let { snippet, name, langId } = Args.fromUser(arg);
                if (snippet) {
                    return resolve(new snippetsFile_1.Snippet([], '', '', '', snippet, '', 1 /* User */));
                }
                let languageId = 0 /* Null */;
                if (langId) {
                    const otherLangId = modeService.getLanguageIdentifier(langId);
                    if (otherLangId) {
                        languageId = otherLangId.id;
                    }
                }
                else {
                    editor.getModel().tokenizeIfCheap(lineNumber);
                    languageId = editor.getModel().getLanguageIdAtPosition(lineNumber, column);
                    // validate the `languageId` to ensure this is a user
                    // facing language with a name and the chance to have
                    // snippets, else fall back to the outer language
                    const otherLangId = modeService.getLanguageIdentifier(languageId);
                    if (otherLangId && !modeService.getLanguageName(otherLangId.language)) {
                        languageId = editor.getModel().getLanguageIdentifier().id;
                    }
                }
                if (name) {
                    // take selected snippet
                    const snippet = (await snippetService.getSnippets(languageId, { includeNoPrefixSnippets: true })).find(snippet => snippet.name === name);
                    resolve(snippet);
                }
                else {
                    // let user pick a snippet
                    const snippet = await this._pickSnippet(snippetService, quickInputService, languageId);
                    resolve(snippet);
                }
            });
            if (!snippet) {
                return;
            }
            let clipboardText;
            if (snippet.needsClipboard) {
                clipboardText = await clipboardService.readText();
            }
            snippetController2_1.SnippetController2.get(editor).insert(snippet.codeSnippet, { clipboardText });
        }
        async _pickSnippet(snippetService, quickInputService, languageId) {
            var _a;
            const snippets = (await snippetService.getSnippets(languageId, { includeDisabledSnippets: true, includeNoPrefixSnippets: true })).sort(snippetsFile_1.Snippet.compare);
            const makeSnippetPicks = () => {
                const result = [];
                let prevSnippet;
                for (const snippet of snippets) {
                    const pick = {
                        label: snippet.prefix || snippet.name,
                        detail: snippet.description,
                        snippet
                    };
                    if (!prevSnippet || prevSnippet.snippetSource !== snippet.snippetSource) {
                        let label = '';
                        switch (snippet.snippetSource) {
                            case 1 /* User */:
                                label = nls.localize(1, null);
                                break;
                            case 3 /* Extension */:
                                label = nls.localize(2, null);
                                break;
                            case 2 /* Workspace */:
                                label = nls.localize(3, null);
                                break;
                        }
                        result.push({ type: 'separator', label });
                    }
                    if (snippet.snippetSource === 3 /* Extension */) {
                        const isEnabled = snippetService.isEnabled(snippet);
                        if (isEnabled) {
                            pick.buttons = [{
                                    iconClass: codicons_1.Codicon.eyeClosed.classNames,
                                    tooltip: nls.localize(4, null)
                                }];
                        }
                        else {
                            pick.description = nls.localize(5, null);
                            pick.buttons = [{
                                    iconClass: codicons_1.Codicon.eye.classNames,
                                    tooltip: nls.localize(6, null)
                                }];
                        }
                    }
                    result.push(pick);
                    prevSnippet = snippet;
                }
                return result;
            };
            const picker = quickInputService.createQuickPick();
            picker.placeholder = nls.localize(7, null);
            picker.matchOnDetail = true;
            picker.ignoreFocusOut = false;
            picker.onDidTriggerItemButton(ctx => {
                const isEnabled = snippetService.isEnabled(ctx.item.snippet);
                snippetService.updateEnablement(ctx.item.snippet, !isEnabled);
                picker.items = makeSnippetPicks();
            });
            picker.items = makeSnippetPicks();
            picker.show();
            // wait for an item to be picked or the picker to become hidden
            await Promise.race([event_1.Event.toPromise(picker.onDidAccept), event_1.Event.toPromise(picker.onDidHide)]);
            const result = (_a = picker.selectedItems[0]) === null || _a === void 0 ? void 0 : _a.snippet;
            picker.dispose();
            return result;
        }
    }
    (0, editorExtensions_1.registerEditorAction)(InsertSnippetAction);
    // compatibility command to make sure old keybinding are still working
    commands_1.CommandsRegistry.registerCommand('editor.action.showSnippets', accessor => {
        return accessor.get(commands_1.ICommandService).executeCommand('editor.action.insertSnippet');
    });
});
//# sourceMappingURL=insertSnippet.js.map