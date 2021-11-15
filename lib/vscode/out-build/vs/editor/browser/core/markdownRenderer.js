/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/editor/common/services/modeService", "vs/base/common/errors", "vs/editor/common/modes/textToHtmlTokenizer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/modes"], function (require, exports, markdownRenderer_1, opener_1, modeService_1, errors_1, textToHtmlTokenizer_1, event_1, lifecycle_1, modes_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkdownRenderer = void 0;
    /**
     * Markdown renderer that can render codeblocks with the editor mechanics. This
     * renderer should always be preferred.
     */
    let MarkdownRenderer = class MarkdownRenderer {
        constructor(_options, _modeService, _openerService) {
            this._options = _options;
            this._modeService = _modeService;
            this._openerService = _openerService;
            this._onDidRenderAsync = new event_1.Emitter();
            this.onDidRenderAsync = this._onDidRenderAsync.event;
        }
        dispose() {
            this._onDidRenderAsync.dispose();
        }
        render(markdown, options, markedOptions) {
            const disposeables = new lifecycle_1.DisposableStore();
            let element;
            if (!markdown) {
                element = document.createElement('span');
            }
            else {
                element = (0, markdownRenderer_1.renderMarkdown)(markdown, Object.assign(Object.assign({}, this._getRenderOptions(markdown, disposeables)), options), markedOptions);
            }
            return {
                element,
                dispose: () => disposeables.dispose()
            };
        }
        _getRenderOptions(markdown, disposeables) {
            return {
                baseUrl: this._options.baseUrl,
                codeBlockRenderer: async (languageAlias, value) => {
                    var _a, _b, _c, _d;
                    // In markdown,
                    // it is possible that we stumble upon language aliases (e.g.js instead of javascript)
                    // it is possible no alias is given in which case we fall back to the current editor lang
                    let modeId;
                    if (languageAlias) {
                        modeId = this._modeService.getModeIdForLanguageName(languageAlias);
                    }
                    else if (this._options.editor) {
                        modeId = (_a = this._options.editor.getModel()) === null || _a === void 0 ? void 0 : _a.getLanguageIdentifier().language;
                    }
                    if (!modeId) {
                        modeId = 'plaintext';
                    }
                    this._modeService.triggerMode(modeId);
                    const tokenization = (_b = await modes_1.TokenizationRegistry.getPromise(modeId)) !== null && _b !== void 0 ? _b : undefined;
                    const element = document.createElement('span');
                    element.innerHTML = ((_d = (_c = MarkdownRenderer._ttpTokenizer) === null || _c === void 0 ? void 0 : _c.createHTML(value, tokenization)) !== null && _d !== void 0 ? _d : (0, textToHtmlTokenizer_1.tokenizeToString)(value, tokenization));
                    // use "good" font
                    let fontFamily = this._options.codeBlockFontFamily;
                    if (this._options.editor) {
                        fontFamily = this._options.editor.getOption(40 /* fontInfo */).fontFamily;
                    }
                    if (fontFamily) {
                        element.style.fontFamily = fontFamily;
                    }
                    return element;
                },
                asyncRenderCallback: () => this._onDidRenderAsync.fire(),
                actionHandler: {
                    callback: (content) => this._openerService.open(content, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: markdown.isTrusted }).catch(errors_1.onUnexpectedError),
                    disposeables
                }
            };
        }
    };
    MarkdownRenderer._ttpTokenizer = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('tokenizeToString', {
        createHTML(value, tokenizer) {
            return (0, textToHtmlTokenizer_1.tokenizeToString)(value, tokenizer);
        }
    });
    MarkdownRenderer = __decorate([
        __param(1, modeService_1.IModeService),
        __param(2, opener_1.IOpenerService)
    ], MarkdownRenderer);
    exports.MarkdownRenderer = MarkdownRenderer;
});
//# sourceMappingURL=markdownRenderer.js.map