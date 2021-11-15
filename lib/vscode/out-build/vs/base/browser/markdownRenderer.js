/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/formattedTextRenderer", "vs/base/common/errors", "vs/base/common/htmlContent", "vs/base/common/idGenerator", "vs/base/common/marked/marked", "vs/base/common/insane/insane", "vs/base/common/marshalling", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/uri", "vs/base/common/network", "vs/base/common/iconLabels", "vs/base/common/resources", "vs/base/browser/mouseEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/event", "vs/base/browser/event"], function (require, exports, DOM, formattedTextRenderer_1, errors_1, htmlContent_1, idGenerator_1, marked, insane_1, marshalling_1, objects_1, strings_1, uri_1, network_1, iconLabels_1, resources_1, mouseEvent_1, iconLabels_2, event_1, event_2) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderMarkdownAsPlaintext = exports.renderMarkdown = void 0;
    const _ttpInsane = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('insane', {
        createHTML(value, options) {
            return (0, insane_1.insane)(value, options);
        }
    });
    /**
     * Low-level way create a html element from a markdown string.
     *
     * **Note** that for most cases you should be using [`MarkdownRenderer`](./src/vs/editor/browser/core/markdownRenderer.ts)
     * which comes with support for pretty code block rendering and which uses the default way of handling links.
     */
    function renderMarkdown(markdown, options = {}, markedOptions = {}) {
        var _a;
        const element = (0, formattedTextRenderer_1.createElement)(options);
        const _uriMassage = function (part) {
            let data;
            try {
                data = (0, marshalling_1.parse)(decodeURIComponent(part));
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            data = (0, objects_1.cloneAndChange)(data, value => {
                if (markdown.uris && markdown.uris[value]) {
                    return uri_1.URI.revive(markdown.uris[value]);
                }
                else {
                    return undefined;
                }
            });
            return encodeURIComponent(JSON.stringify(data));
        };
        const _href = function (href, isDomUri) {
            const data = markdown.uris && markdown.uris[href];
            if (!data) {
                return href; // no uri exists
            }
            let uri = uri_1.URI.revive(data);
            if (uri_1.URI.parse(href).toString() === uri.toString()) {
                return href; // no tranformation performed
            }
            if (isDomUri) {
                // this URI will end up as "src"-attribute of a dom node
                // and because of that special rewriting needs to be done
                // so that the URI uses a protocol that's understood by
                // browsers (like http or https)
                return network_1.FileAccess.asBrowserUri(uri).toString(true);
            }
            if (uri.query) {
                uri = uri.with({ query: _uriMassage(uri.query) });
            }
            return uri.toString();
        };
        // signal to code-block render that the
        // element has been created
        let signalInnerHTML;
        const withInnerHTML = new Promise(c => signalInnerHTML = c);
        const renderer = new marked.Renderer();
        renderer.image = (href, title, text) => {
            let dimensions = [];
            let attributes = [];
            if (href) {
                ({ href, dimensions } = (0, htmlContent_1.parseHrefAndDimensions)(href));
                href = _href(href, true);
                try {
                    const hrefAsUri = uri_1.URI.parse(href);
                    if (options.baseUrl && hrefAsUri.scheme === network_1.Schemas.file) { // absolute or relative local path, or file: uri
                        href = (0, resources_1.resolvePath)(options.baseUrl, href).toString();
                    }
                }
                catch (err) { }
                attributes.push(`src="${href}"`);
            }
            if (text) {
                attributes.push(`alt="${text}"`);
            }
            if (title) {
                attributes.push(`title="${title}"`);
            }
            if (dimensions.length) {
                attributes = attributes.concat(dimensions);
            }
            return '<img ' + attributes.join(' ') + '>';
        };
        renderer.link = (href, title, text) => {
            // Remove markdown escapes. Workaround for https://github.com/chjj/marked/issues/829
            if (href === text) { // raw link case
                text = (0, htmlContent_1.removeMarkdownEscapes)(text);
            }
            href = _href(href, false);
            if (options.baseUrl) {
                const hasScheme = /^\w[\w\d+.-]*:/.test(href);
                if (!hasScheme) {
                    href = (0, resources_1.resolvePath)(options.baseUrl, href).toString();
                }
            }
            title = (0, htmlContent_1.removeMarkdownEscapes)(title);
            href = (0, htmlContent_1.removeMarkdownEscapes)(href);
            if (!href
                || href.match(/^data:|javascript:/i)
                || (href.match(/^command:/i) && !markdown.isTrusted)
                || href.match(/^command:(\/\/\/)?_workbench\.downloadResource/i)) {
                // drop the link
                return text;
            }
            else {
                // HTML Encode href
                href = href.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                return `<a href="#" data-href="${href}" title="${title || href}">${text}</a>`;
            }
        };
        renderer.paragraph = (text) => {
            if (markdown.supportThemeIcons) {
                const elements = (0, iconLabels_2.renderLabelWithIcons)(text);
                text = elements.map(e => typeof e === 'string' ? e : e.outerHTML).join('');
            }
            return `<p>${text}</p>`;
        };
        if (options.codeBlockRenderer) {
            renderer.code = (code, lang) => {
                const value = options.codeBlockRenderer(lang, code);
                // when code-block rendering is async we return sync
                // but update the node with the real result later.
                const id = idGenerator_1.defaultGenerator.nextId();
                const promise = Promise.all([value, withInnerHTML]).then(values => {
                    const span = element.querySelector(`div[data-code="${id}"]`);
                    if (span) {
                        DOM.reset(span, values[0]);
                    }
                }).catch(_err => {
                    // ignore
                });
                if (options.asyncRenderCallback) {
                    promise.then(options.asyncRenderCallback);
                }
                return `<div class="code" data-code="${id}">${(0, strings_1.escape)(code)}</div>`;
            };
        }
        if (options.actionHandler) {
            options.actionHandler.disposeables.add(event_1.Event.any((0, event_2.domEvent)(element, 'click'), (0, event_2.domEvent)(element, 'auxclick'))(e => {
                const mouseEvent = new mouseEvent_1.StandardMouseEvent(e);
                if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
                    return;
                }
                let target = mouseEvent.target;
                if (target.tagName !== 'A') {
                    target = target.parentElement;
                    if (!target || target.tagName !== 'A') {
                        return;
                    }
                }
                try {
                    const href = target.dataset['href'];
                    if (href) {
                        options.actionHandler.callback(href, mouseEvent);
                    }
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                finally {
                    mouseEvent.preventDefault();
                }
            }));
        }
        // Use our own sanitizer so that we can let through only spans.
        // Otherwise, we'd be letting all html be rendered.
        // If we want to allow markdown permitted tags, then we can delete sanitizer and sanitize.
        // We always pass the output through insane after this so that we don't rely on
        // marked for sanitization.
        markedOptions.sanitizer = (html) => {
            const match = markdown.isTrusted ? html.match(/^(<span[^>]+>)|(<\/\s*span>)$/) : undefined;
            return match ? html : '';
        };
        markedOptions.sanitize = true;
        markedOptions.silent = true;
        markedOptions.renderer = renderer;
        // values that are too long will freeze the UI
        let value = (_a = markdown.value) !== null && _a !== void 0 ? _a : '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        // escape theme icons
        if (markdown.supportThemeIcons) {
            value = (0, iconLabels_1.markdownEscapeEscapedIcons)(value);
        }
        const renderedMarkdown = marked.parse(value, markedOptions);
        // sanitize with insane
        element.innerHTML = sanitizeRenderedMarkdown(markdown, renderedMarkdown);
        // signal that async code blocks can be now be inserted
        signalInnerHTML();
        // signal size changes for image tags
        if (options.asyncRenderCallback) {
            for (const img of element.getElementsByTagName('img')) {
                const listener = DOM.addDisposableListener(img, 'load', () => {
                    listener.dispose();
                    options.asyncRenderCallback();
                });
            }
        }
        return element;
    }
    exports.renderMarkdown = renderMarkdown;
    function sanitizeRenderedMarkdown(options, renderedMarkdown) {
        var _a;
        const insaneOptions = getInsaneOptions(options);
        return (_a = _ttpInsane === null || _ttpInsane === void 0 ? void 0 : _ttpInsane.createHTML(renderedMarkdown, insaneOptions)) !== null && _a !== void 0 ? _a : (0, insane_1.insane)(renderedMarkdown, insaneOptions);
    }
    function getInsaneOptions(options) {
        const allowedSchemes = [
            network_1.Schemas.http,
            network_1.Schemas.https,
            network_1.Schemas.mailto,
            network_1.Schemas.data,
            network_1.Schemas.file,
            network_1.Schemas.vscodeRemote,
            network_1.Schemas.vscodeRemoteResource,
        ];
        if (options.isTrusted) {
            allowedSchemes.push(network_1.Schemas.command);
        }
        return {
            allowedSchemes,
            // allowedTags should included everything that markdown renders to.
            // Since we have our own sanitize function for marked, it's possible we missed some tag so let insane make sure.
            // HTML tags that can result from markdown are from reading https://spec.commonmark.org/0.29/
            // HTML table tags that can result from markdown are from https://github.github.com/gfm/#tables-extension-
            allowedTags: ['ul', 'li', 'p', 'code', 'blockquote', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'em', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'del', 'a', 'strong', 'br', 'img', 'span'],
            allowedAttributes: {
                'a': ['href', 'name', 'target', 'data-href'],
                'img': ['src', 'title', 'alt', 'width', 'height'],
                'div': ['class', 'data-code'],
                'span': ['class', 'style'],
                // https://github.com/microsoft/vscode/issues/95937
                'th': ['align'],
                'td': ['align']
            },
            filter(token) {
                if (token.tag === 'span' && options.isTrusted) {
                    if (token.attrs['style'] && (Object.keys(token.attrs).length === 1)) {
                        return !!token.attrs['style'].match(/^(color\:#[0-9a-fA-F]+;)?(background-color\:#[0-9a-fA-F]+;)?$/);
                    }
                    else if (token.attrs['class']) {
                        // The class should match codicon rendering in src\vs\base\common\codicons.ts
                        return !!token.attrs['class'].match(/^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/);
                    }
                    return false;
                }
                return true;
            }
        };
    }
    /**
     * Strips all markdown from `markdown`. For example `# Header` would be output as `Header`.
     */
    function renderMarkdownAsPlaintext(markdown) {
        var _a;
        const renderer = new marked.Renderer();
        renderer.code = (code) => {
            return code;
        };
        renderer.blockquote = (quote) => {
            return quote;
        };
        renderer.html = (_html) => {
            return '';
        };
        renderer.heading = (text, _level, _raw) => {
            return text + '\n';
        };
        renderer.hr = () => {
            return '';
        };
        renderer.list = (body, _ordered) => {
            return body;
        };
        renderer.listitem = (text) => {
            return text + '\n';
        };
        renderer.paragraph = (text) => {
            return text + '\n';
        };
        renderer.table = (header, body) => {
            return header + body + '\n';
        };
        renderer.tablerow = (content) => {
            return content;
        };
        renderer.tablecell = (content, _flags) => {
            return content + ' ';
        };
        renderer.strong = (text) => {
            return text;
        };
        renderer.em = (text) => {
            return text;
        };
        renderer.codespan = (code) => {
            return code;
        };
        renderer.br = () => {
            return '\n';
        };
        renderer.del = (text) => {
            return text;
        };
        renderer.image = (_href, _title, _text) => {
            return '';
        };
        renderer.text = (text) => {
            return text;
        };
        renderer.link = (_href, _title, text) => {
            return text;
        };
        // values that are too long will freeze the UI
        let value = (_a = markdown.value) !== null && _a !== void 0 ? _a : '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        const unescapeInfo = new Map([
            ['&quot;', '"'],
            ['&amp;', '&'],
            ['&#39;', '\''],
            ['&lt;', '<'],
            ['&gt;', '>'],
        ]);
        const html = marked.parse(value, { renderer }).replace(/&(#\d+|[a-zA-Z]+);/g, m => { var _a; return (_a = unescapeInfo.get(m)) !== null && _a !== void 0 ? _a : m; });
        return sanitizeRenderedMarkdown({ isTrusted: false }, html).toString();
    }
    exports.renderMarkdownAsPlaintext = renderMarkdownAsPlaintext;
});
//# sourceMappingURL=markdownRenderer.js.map