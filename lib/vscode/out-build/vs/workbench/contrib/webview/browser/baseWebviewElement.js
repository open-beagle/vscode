/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/webview/browser/baseWebviewElement", "vs/platform/webview/common/webviewPortMapping", "vs/workbench/contrib/webview/browser/resourceLoading", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, async_1, buffer_1, cancellation_1, event_1, lifecycle_1, uri_1, nls_1, webviewPortMapping_1, resourceLoading_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseWebview = exports.WebviewMessageChannels = void 0;
    var WebviewMessageChannels;
    (function (WebviewMessageChannels) {
        WebviewMessageChannels["onmessage"] = "onmessage";
        WebviewMessageChannels["didClickLink"] = "did-click-link";
        WebviewMessageChannels["didScroll"] = "did-scroll";
        WebviewMessageChannels["didFocus"] = "did-focus";
        WebviewMessageChannels["didBlur"] = "did-blur";
        WebviewMessageChannels["didLoad"] = "did-load";
        WebviewMessageChannels["doUpdateState"] = "do-update-state";
        WebviewMessageChannels["doReload"] = "do-reload";
        WebviewMessageChannels["setConfirmBeforeClose"] = "set-confirm-before-close";
        WebviewMessageChannels["loadResource"] = "load-resource";
        WebviewMessageChannels["loadLocalhost"] = "load-localhost";
        WebviewMessageChannels["webviewReady"] = "webview-ready";
        WebviewMessageChannels["wheel"] = "did-scroll-wheel";
        WebviewMessageChannels["fatalError"] = "fatal-error";
    })(WebviewMessageChannels = exports.WebviewMessageChannels || (exports.WebviewMessageChannels = {}));
    var WebviewState;
    (function (WebviewState) {
        let Type;
        (function (Type) {
            Type[Type["Initializing"] = 0] = "Initializing";
            Type[Type["Ready"] = 1] = "Ready";
        })(Type = WebviewState.Type || (WebviewState.Type = {}));
        class Initializing {
            constructor(pendingMessages) {
                this.pendingMessages = pendingMessages;
                this.type = 0 /* Initializing */;
            }
        }
        WebviewState.Initializing = Initializing;
        WebviewState.Ready = { type: 1 /* Ready */ };
    })(WebviewState || (WebviewState = {}));
    class BaseWebview extends lifecycle_1.Disposable {
        constructor(id, options, contentOptions, extension, webviewThemeDataProvider, services) {
            super();
            this.id = id;
            this.options = options;
            this.extension = extension;
            this.webviewThemeDataProvider = webviewThemeDataProvider;
            this._state = new WebviewState.Initializing([]);
            this._resourceLoadingCts = this._register(new cancellation_1.CancellationTokenSource());
            this._focusDelayer = this._register(new async_1.ThrottledDelayer(10));
            this._onMissingCsp = this._register(new event_1.Emitter());
            this.onMissingCsp = this._onMissingCsp.event;
            this._onDidClickLink = this._register(new event_1.Emitter());
            this.onDidClickLink = this._onDidClickLink.event;
            this._onDidReload = this._register(new event_1.Emitter());
            this.onDidReload = this._onDidReload.event;
            this._onMessage = this._register(new event_1.Emitter());
            this.onMessage = this._onMessage.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidWheel = this._register(new event_1.Emitter());
            this.onDidWheel = this._onDidWheel.event;
            this._onDidUpdateState = this._register(new event_1.Emitter());
            this.onDidUpdateState = this._onDidUpdateState.event;
            this._onDidFocus = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidDispose = this._register(new event_1.Emitter());
            this.onDidDispose = this._onDidDispose.event;
            this._hasAlertedAboutMissingCsp = false;
            this._environmentService = services.environmentService;
            this._fileService = services.fileService;
            this._logService = services.logService;
            this._remoteAuthorityResolverService = services.remoteAuthorityResolverService;
            this._requestService = services.requestService;
            this._telemetryService = services.telemetryService;
            this._tunnelService = services.tunnelService;
            this.content = {
                html: '',
                options: contentOptions,
                state: undefined
            };
            this._portMappingManager = this._register(new webviewPortMapping_1.WebviewPortMappingManager(() => { var _a; return (_a = this.extension) === null || _a === void 0 ? void 0 : _a.location; }, () => this.content.options.portMapping || [], this._tunnelService));
            this._element = this.createElement(options, contentOptions);
            const subscription = this._register(this.on("webview-ready" /* webviewReady */, () => {
                var _a;
                this._logService.debug(`Webview(${this.id}): webview ready`);
                (_a = this.element) === null || _a === void 0 ? void 0 : _a.classList.add('ready');
                if (this._state.type === 0 /* Initializing */) {
                    this._state.pendingMessages.forEach(({ channel, data }) => this.doPostMessage(channel, data));
                }
                this._state = WebviewState.Ready;
                subscription.dispose();
            }));
            this._register(this.on('no-csp-found', () => {
                this.handleNoCspFound();
            }));
            this._register(this.on("did-click-link" /* didClickLink */, (uri) => {
                this._onDidClickLink.fire(uri);
            }));
            this._register(this.on("onmessage" /* onmessage */, (data) => {
                this._onMessage.fire({
                    message: data.message,
                    transfer: data.transfer,
                });
            }));
            this._register(this.on("did-scroll" /* didScroll */, (scrollYPercentage) => {
                this._onDidScroll.fire({ scrollYPercentage: scrollYPercentage });
            }));
            this._register(this.on("do-reload" /* doReload */, () => {
                this.reload();
            }));
            this._register(this.on("do-update-state" /* doUpdateState */, (state) => {
                this.state = state;
                this._onDidUpdateState.fire(state);
            }));
            this._register(this.on("did-focus" /* didFocus */, () => {
                this.handleFocusChange(true);
            }));
            this._register(this.on("did-scroll-wheel" /* wheel */, (event) => {
                this._onDidWheel.fire(event);
            }));
            this._register(this.on("did-blur" /* didBlur */, () => {
                this.handleFocusChange(false);
            }));
            this._register(this.on("fatal-error" /* fatalError */, (e) => {
                services.notificationService.error((0, nls_1.localize)(0, null, e.message));
            }));
            this._register(this.on('did-keydown', (data) => {
                // Electron: workaround for https://github.com/electron/electron/issues/14258
                // We have to detect keyboard events in the <webview> and dispatch them to our
                // keybinding service because these events do not bubble to the parent window anymore.
                this.handleKeyEvent('keydown', data);
            }));
            this._register(this.on('did-keyup', (data) => {
                this.handleKeyEvent('keyup', data);
            }));
            this._register(this.on("load-resource" /* loadResource */, (entry) => {
                const rawPath = entry.path;
                const uri = uri_1.URI.parse(rawPath.replace(/^\/([\w\-]+)(\/{1,2})/, (_, scheme, sep) => {
                    if (sep.length === 1) {
                        return `${scheme}:///`; // Add empty authority.
                    }
                    else {
                        return `${scheme}://`; // Url has own authority.
                    }
                })).with({
                    query: decodeURIComponent(entry.query),
                });
                this.loadResource(entry.id, rawPath, uri, entry.ifNoneMatch);
            }));
            this._register(this.on("load-localhost" /* loadLocalhost */, (entry) => {
                this.localLocalhost(entry.id, entry.origin);
            }));
            this.style();
            this._register(webviewThemeDataProvider.onThemeDataChanged(this.style, this));
        }
        get element() { return this._element; }
        get isFocused() { return !!this._focused; }
        dispose() {
            if (this.element) {
                this.element.remove();
            }
            this._element = undefined;
            this._onDidDispose.fire();
            this._resourceLoadingCts.dispose(true);
            super.dispose();
        }
        postMessage(message, transfer) {
            this._send('message', { message, transfer });
        }
        _send(channel, data) {
            if (this._state.type === 0 /* Initializing */) {
                this._state.pendingMessages.push({ channel, data });
            }
            else {
                this.doPostMessage(channel, data);
            }
        }
        handleNoCspFound() {
            if (this._hasAlertedAboutMissingCsp) {
                return;
            }
            this._hasAlertedAboutMissingCsp = true;
            if (this.extension && this.extension.id) {
                if (this._environmentService.isExtensionDevelopment) {
                    this._onMissingCsp.fire(this.extension.id);
                }
                this._telemetryService.publicLog2('webviewMissingCsp', {
                    extension: this.extension.id.value
                });
            }
        }
        reload() {
            this.doUpdateContent(this.content);
            const subscription = this._register(this.on("did-load" /* didLoad */, () => {
                this._onDidReload.fire();
                subscription.dispose();
            }));
        }
        set html(value) {
            const rewrittenHtml = this.rewriteVsCodeResourceUrls(value);
            this.doUpdateContent({
                html: rewrittenHtml,
                options: this.content.options,
                state: this.content.state,
            });
        }
        rewriteVsCodeResourceUrls(value) {
            return value
                .replace(/(["'])(?:vscode-resource):(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (match, startQuote, _1, scheme, path, endQuote) => {
                if (scheme) {
                    return `${startQuote}${this.webviewResourceEndpoint}/vscode-resource/${scheme}${path}${endQuote}`;
                }
                return `${startQuote}${this.webviewResourceEndpoint}/vscode-resource/file${path}${endQuote}`;
            })
                .replace(/(["'])(?:vscode-webview-resource):(\/\/[^\s\/'"]+\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (match, startQuote, _1, scheme, path, endQuote) => {
                if (scheme) {
                    return `${startQuote}${this.webviewResourceEndpoint}/vscode-resource/${scheme}${path}${endQuote}`;
                }
                return `${startQuote}${this.webviewResourceEndpoint}/vscode-resource/file${path}${endQuote}`;
            });
        }
        set contentOptions(options) {
            this._logService.debug(`Webview(${this.id}): will update content options`);
            if ((0, webview_1.areWebviewContentOptionsEqual)(options, this.content.options)) {
                this._logService.debug(`Webview(${this.id}): skipping content options update`);
                return;
            }
            this.doUpdateContent({
                html: this.content.html,
                options: options,
                state: this.content.state,
            });
        }
        set localResourcesRoot(resources) {
            this.content = Object.assign(Object.assign({}, this.content), { options: Object.assign(Object.assign({}, this.content.options), { localResourceRoots: resources }) });
        }
        set state(state) {
            this.content = {
                html: this.content.html,
                options: this.content.options,
                state,
            };
        }
        set initialScrollProgress(value) {
            this._send('initial-scroll-position', value);
        }
        doUpdateContent(newContent) {
            this._logService.debug(`Webview(${this.id}): will update content`);
            this.content = newContent;
            this._send('content', Object.assign({ contents: this.content.html, options: this.content.options, state: this.content.state, resourceEndpoint: this.webviewResourceEndpoint }, this.extraContentOptions));
        }
        style() {
            let { styles, activeTheme, themeLabel } = this.webviewThemeDataProvider.getWebviewThemeData();
            if (this.options.transformCssVariables) {
                styles = this.options.transformCssVariables(styles);
            }
            this._send('styles', { styles, activeTheme, themeName: themeLabel });
        }
        handleFocusChange(isFocused) {
            this._focused = isFocused;
            if (isFocused) {
                this._onDidFocus.fire();
            }
            else {
                this._onDidBlur.fire();
            }
        }
        handleKeyEvent(type, event) {
            // Create a fake KeyboardEvent from the data provided
            const emulatedKeyboardEvent = new KeyboardEvent(type, event);
            // Force override the target
            Object.defineProperty(emulatedKeyboardEvent, 'target', {
                get: () => this.element,
            });
            // And re-dispatch
            window.dispatchEvent(emulatedKeyboardEvent);
        }
        windowDidDragStart() {
            // Webview break drag and droping around the main window (no events are generated when you are over them)
            // Work around this by disabling pointer events during the drag.
            // https://github.com/electron/electron/issues/18226
            if (this.element) {
                this.element.style.pointerEvents = 'none';
            }
        }
        windowDidDragEnd() {
            if (this.element) {
                this.element.style.pointerEvents = '';
            }
        }
        selectAll() {
            this.execCommand('selectAll');
        }
        copy() {
            this.execCommand('copy');
        }
        paste() {
            this.execCommand('paste');
        }
        cut() {
            this.execCommand('cut');
        }
        undo() {
            this.execCommand('undo');
        }
        redo() {
            this.execCommand('redo');
        }
        execCommand(command) {
            if (this.element) {
                this._send('execCommand', command);
            }
        }
        async loadResource(id, requestPath, uri, ifNoneMatch) {
            var _a;
            try {
                const remoteAuthority = this._environmentService.remoteAuthority;
                const remoteConnectionData = remoteAuthority ? this._remoteAuthorityResolverService.getConnectionData(remoteAuthority) : null;
                const result = await (0, resourceLoading_1.loadLocalResource)(uri, ifNoneMatch, {
                    extensionLocation: (_a = this.extension) === null || _a === void 0 ? void 0 : _a.location,
                    roots: this.content.options.localResourceRoots || [],
                    remoteConnectionData,
                    useRootAuthority: this.content.options.useRootAuthority
                }, this._fileService, this._requestService, this._logService, this._resourceLoadingCts.token);
                switch (result.type) {
                    case resourceLoading_1.WebviewResourceResponse.Type.Success:
                        {
                            const { buffer } = await (0, buffer_1.streamToBuffer)(result.stream);
                            return this._send('did-load-resource', {
                                id,
                                status: 200,
                                path: requestPath,
                                mime: result.mimeType,
                                data: buffer,
                                etag: result.etag,
                            });
                        }
                    case resourceLoading_1.WebviewResourceResponse.Type.NotModified:
                        {
                            return this._send('did-load-resource', {
                                id,
                                status: 304,
                                path: requestPath,
                                mime: result.mimeType,
                            });
                        }
                    case resourceLoading_1.WebviewResourceResponse.Type.AccessDenied:
                        {
                            return this._send('did-load-resource', {
                                id,
                                status: 401,
                                path: requestPath,
                            });
                        }
                }
            }
            catch (_b) {
                // noop
            }
            return this._send('did-load-resource', {
                id,
                status: 404,
                path: requestPath
            });
        }
        async localLocalhost(id, origin) {
            const authority = this._environmentService.remoteAuthority;
            const resolveAuthority = authority ? await this._remoteAuthorityResolverService.resolveAuthority(authority) : undefined;
            const redirect = resolveAuthority ? await this._portMappingManager.getRedirect(resolveAuthority.authority, origin) : undefined;
            return this._send('did-load-localhost', {
                id,
                origin,
                location: redirect
            });
        }
        focus() {
            this.doFocus();
            // Handle focus change programmatically (do not rely on event from <webview>)
            this.handleFocusChange(true);
        }
        doFocus() {
            if (!this.element) {
                return;
            }
            // Clear the existing focus first if not already on the webview.
            // This is required because the next part where we set the focus is async.
            if (document.activeElement && document.activeElement instanceof HTMLElement && document.activeElement !== this.element) {
                // Don't blur if on the webview because this will also happen async and may unset the focus
                // after the focus trigger fires below.
                document.activeElement.blur();
            }
            // Workaround for https://github.com/microsoft/vscode/issues/75209
            // Electron's webview.focus is async so for a sequence of actions such as:
            //
            // 1. Open webview
            // 1. Show quick pick from command palette
            //
            // We end up focusing the webview after showing the quick pick, which causes
            // the quick pick to instantly dismiss.
            //
            // Workaround this by debouncing the focus and making sure we are not focused on an input
            // when we try to re-focus.
            this._focusDelayer.trigger(async () => {
                var _a;
                if (!this.isFocused || !this.element) {
                    return;
                }
                if (document.activeElement && ((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.tagName) !== 'BODY') {
                    return;
                }
                try {
                    this.elementFocusImpl();
                }
                catch (_b) {
                    // noop
                }
                this._send('focus');
            });
        }
    }
    exports.BaseWebview = BaseWebview;
});
//# sourceMappingURL=baseWebviewElement.js.map