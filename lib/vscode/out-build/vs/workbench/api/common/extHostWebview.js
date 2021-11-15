/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/uri", "vs/platform/extensions/common/extensionValidator", "vs/workbench/api/common/extHostWebviewMessaging", "vs/workbench/api/common/shared/webview", "./extHost.protocol"], function (require, exports, buffer_1, event_1, uri_1, extensionValidator_1, extHostWebviewMessaging_1, webview_1, extHostProtocol) {
    "use strict";
    var _ExtHostWebview_handle, _ExtHostWebview_proxy, _ExtHostWebview_deprecationService, _ExtHostWebview_initData, _ExtHostWebview_workspace, _ExtHostWebview_extension, _ExtHostWebview_html, _ExtHostWebview_options, _ExtHostWebview_isDisposed, _ExtHostWebview_hasCalledAsWebviewUri, _ExtHostWebview_serializeBuffersForPostMessage, _ExtHostWebview_onDidDisposeEmitter;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveOptions = exports.serializeWebviewOptions = exports.toExtensionData = exports.ExtHostWebviews = exports.serializeMessage = exports.shouldSerializeBuffersForPostMessage = exports.ExtHostWebview = void 0;
    class ExtHostWebview {
        constructor(handle, proxy, options, initData, workspace, extension, deprecationService) {
            _ExtHostWebview_handle.set(this, void 0);
            _ExtHostWebview_proxy.set(this, void 0);
            _ExtHostWebview_deprecationService.set(this, void 0);
            _ExtHostWebview_initData.set(this, void 0);
            _ExtHostWebview_workspace.set(this, void 0);
            _ExtHostWebview_extension.set(this, void 0);
            _ExtHostWebview_html.set(this, '');
            _ExtHostWebview_options.set(this, void 0);
            _ExtHostWebview_isDisposed.set(this, false);
            _ExtHostWebview_hasCalledAsWebviewUri.set(this, false);
            _ExtHostWebview_serializeBuffersForPostMessage.set(this, false);
            /* internal */ this._onMessageEmitter = new event_1.Emitter();
            this.onDidReceiveMessage = this._onMessageEmitter.event;
            _ExtHostWebview_onDidDisposeEmitter.set(this, new event_1.Emitter());
            /* internal */ this._onDidDispose = __classPrivateFieldGet(this, _ExtHostWebview_onDidDisposeEmitter, "f").event;
            __classPrivateFieldSet(this, _ExtHostWebview_handle, handle, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_proxy, proxy, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_options, options, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_initData, initData, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_workspace, workspace, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_extension, extension, "f");
            __classPrivateFieldSet(this, _ExtHostWebview_serializeBuffersForPostMessage, shouldSerializeBuffersForPostMessage(extension), "f");
            __classPrivateFieldSet(this, _ExtHostWebview_deprecationService, deprecationService, "f");
        }
        dispose() {
            __classPrivateFieldSet(this, _ExtHostWebview_isDisposed, true, "f");
            __classPrivateFieldGet(this, _ExtHostWebview_onDidDisposeEmitter, "f").fire();
            __classPrivateFieldGet(this, _ExtHostWebview_onDidDisposeEmitter, "f").dispose();
            this._onMessageEmitter.dispose();
        }
        asWebviewUri(resource) {
            __classPrivateFieldSet(this, _ExtHostWebview_hasCalledAsWebviewUri, true, "f");
            return (0, webview_1.asWebviewUri)(__classPrivateFieldGet(this, _ExtHostWebview_initData, "f"), __classPrivateFieldGet(this, _ExtHostWebview_handle, "f"), resource);
        }
        get cspSource() {
            return __classPrivateFieldGet(this, _ExtHostWebview_initData, "f").webviewCspSource
                .replace('{{uuid}}', __classPrivateFieldGet(this, _ExtHostWebview_handle, "f"));
        }
        get html() {
            this.assertNotDisposed();
            return __classPrivateFieldGet(this, _ExtHostWebview_html, "f");
        }
        set html(value) {
            this.assertNotDisposed();
            if (__classPrivateFieldGet(this, _ExtHostWebview_html, "f") !== value) {
                __classPrivateFieldSet(this, _ExtHostWebview_html, value, "f");
                if (!__classPrivateFieldGet(this, _ExtHostWebview_hasCalledAsWebviewUri, "f") && /(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                    __classPrivateFieldSet(this, _ExtHostWebview_hasCalledAsWebviewUri, true, "f");
                    __classPrivateFieldGet(this, _ExtHostWebview_deprecationService, "f").report('Webview vscode-resource: uris', __classPrivateFieldGet(this, _ExtHostWebview_extension, "f"), `Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
                }
                __classPrivateFieldGet(this, _ExtHostWebview_proxy, "f").$setHtml(__classPrivateFieldGet(this, _ExtHostWebview_handle, "f"), value);
            }
        }
        get options() {
            this.assertNotDisposed();
            return __classPrivateFieldGet(this, _ExtHostWebview_options, "f");
        }
        set options(newOptions) {
            this.assertNotDisposed();
            __classPrivateFieldGet(this, _ExtHostWebview_proxy, "f").$setOptions(__classPrivateFieldGet(this, _ExtHostWebview_handle, "f"), serializeWebviewOptions(__classPrivateFieldGet(this, _ExtHostWebview_extension, "f"), __classPrivateFieldGet(this, _ExtHostWebview_workspace, "f"), newOptions));
            __classPrivateFieldSet(this, _ExtHostWebview_options, newOptions, "f");
        }
        async postMessage(message) {
            if (__classPrivateFieldGet(this, _ExtHostWebview_isDisposed, "f")) {
                return false;
            }
            const serialized = serializeMessage(message, { serializeBuffersForPostMessage: __classPrivateFieldGet(this, _ExtHostWebview_serializeBuffersForPostMessage, "f") });
            return __classPrivateFieldGet(this, _ExtHostWebview_proxy, "f").$postMessage(__classPrivateFieldGet(this, _ExtHostWebview_handle, "f"), serialized.message, ...serialized.buffers);
        }
        assertNotDisposed() {
            if (__classPrivateFieldGet(this, _ExtHostWebview_isDisposed, "f")) {
                throw new Error('Webview is disposed');
            }
        }
    }
    exports.ExtHostWebview = ExtHostWebview;
    _ExtHostWebview_handle = new WeakMap(), _ExtHostWebview_proxy = new WeakMap(), _ExtHostWebview_deprecationService = new WeakMap(), _ExtHostWebview_initData = new WeakMap(), _ExtHostWebview_workspace = new WeakMap(), _ExtHostWebview_extension = new WeakMap(), _ExtHostWebview_html = new WeakMap(), _ExtHostWebview_options = new WeakMap(), _ExtHostWebview_isDisposed = new WeakMap(), _ExtHostWebview_hasCalledAsWebviewUri = new WeakMap(), _ExtHostWebview_serializeBuffersForPostMessage = new WeakMap(), _ExtHostWebview_onDidDisposeEmitter = new WeakMap();
    function shouldSerializeBuffersForPostMessage(extension) {
        if (!extension.enableProposedApi) {
            return false;
        }
        try {
            const version = (0, extensionValidator_1.normalizeVersion)((0, extensionValidator_1.parseVersion)(extension.engines.vscode));
            return !!version && version.majorBase >= 1 && version.minorBase >= 56;
        }
        catch (_a) {
            return false;
        }
    }
    exports.shouldSerializeBuffersForPostMessage = shouldSerializeBuffersForPostMessage;
    function serializeMessage(message, options) {
        if (options.serializeBuffersForPostMessage) {
            // Extract all ArrayBuffers from the message and replace them with references.
            const vsBuffers = [];
            const replacer = (_key, value) => {
                if (value && value instanceof ArrayBuffer) {
                    let index = vsBuffers.findIndex(x => x.original === value);
                    if (index === -1) {
                        const bytes = new Uint8Array(value);
                        const vsBuffer = buffer_1.VSBuffer.wrap(bytes);
                        index = vsBuffers.length;
                        vsBuffers.push({ original: value, vsBuffer });
                    }
                    return {
                        $$vscode_array_buffer_reference$$: true,
                        index,
                    };
                }
                return value;
            };
            const serializedMessage = JSON.stringify(message, replacer);
            return { message: serializedMessage, buffers: vsBuffers.map(x => x.vsBuffer) };
        }
        else {
            return { message: JSON.stringify(message), buffers: [] };
        }
    }
    exports.serializeMessage = serializeMessage;
    class ExtHostWebviews {
        constructor(mainContext, initData, workspace, _logService, _deprecationService) {
            this.initData = initData;
            this.workspace = workspace;
            this._logService = _logService;
            this._deprecationService = _deprecationService;
            this._webviews = new Map();
            this._webviewProxy = mainContext.getProxy(extHostProtocol.MainContext.MainThreadWebviews);
        }
        $onMessage(handle, jsonMessage, ...buffers) {
            const webview = this.getWebview(handle);
            if (webview) {
                const { message } = (0, extHostWebviewMessaging_1.deserializeWebviewMessage)(jsonMessage, buffers);
                webview._onMessageEmitter.fire(message);
            }
        }
        $onMissingCsp(_handle, extensionId) {
            this._logService.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
        }
        createNewWebview(handle, options, extension) {
            const webview = new ExtHostWebview(handle, this._webviewProxy, reviveOptions(options), this.initData, this.workspace, extension, this._deprecationService);
            this._webviews.set(handle, webview);
            webview._onDidDispose(() => { this._webviews.delete(handle); });
            return webview;
        }
        deleteWebview(handle) {
            this._webviews.delete(handle);
        }
        getWebview(handle) {
            return this._webviews.get(handle);
        }
    }
    exports.ExtHostWebviews = ExtHostWebviews;
    function toExtensionData(extension) {
        return { id: extension.identifier, location: extension.extensionLocation };
    }
    exports.toExtensionData = toExtensionData;
    function serializeWebviewOptions(extension, workspace, options) {
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            portMapping: options.portMapping,
            localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace)
        };
    }
    exports.serializeWebviewOptions = serializeWebviewOptions;
    function reviveOptions(options) {
        var _a;
        return {
            enableCommandUris: options.enableCommandUris,
            enableScripts: options.enableScripts,
            portMapping: options.portMapping,
            localResourceRoots: (_a = options.localResourceRoots) === null || _a === void 0 ? void 0 : _a.map(components => uri_1.URI.from(components)),
        };
    }
    exports.reviveOptions = reviveOptions;
    function getDefaultLocalResourceRoots(extension, workspace) {
        return [
            ...((workspace === null || workspace === void 0 ? void 0 : workspace.getWorkspaceFolders()) || []).map(x => x.uri),
            extension.extensionLocation,
        ];
    }
});
//# sourceMappingURL=extHostWebview.js.map