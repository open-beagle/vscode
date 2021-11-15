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
define(["require", "exports", "vs/base/worker/defaultWorkerFactory", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/api/common/extHost.protocol", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/base/common/platform", "vs/base/browser/dom", "vs/workbench/services/extensions/common/extensions", "vs/platform/product/common/productService", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "vs/nls!vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/base/common/uuid", "vs/base/common/errors", "vs/base/common/async", "vs/base/common/network", "vs/platform/layout/browser/layoutService"], function (require, exports, defaultWorkerFactory_1, event_1, lifecycle_1, buffer_1, extensionHostProtocol_1, extHost_protocol_1, telemetry_1, workspace_1, label_1, log_1, platform, dom, extensions_1, productService_1, environmentService_1, resources_1, platform_1, output_1, nls_1, uuid_1, errors_1, async_1, network_1, layoutService_1) {
    "use strict";
    var _a, _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebWorkerExtensionHost = void 0;
    const ttPolicy = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('webWorkerExtensionHost', { createScriptURL: value => value });
    const ttPolicyNestedWorker = (_b = window.trustedTypes) === null || _b === void 0 ? void 0 : _b.createPolicy('webNestedWorkerExtensionHost', {
        createScriptURL(value) {
            if (value.startsWith('blob:')) {
                return value;
            }
            throw new Error(value + ' is NOT allowed');
        }
    });
    let WebWorkerExtensionHost = class WebWorkerExtensionHost extends lifecycle_1.Disposable {
        constructor(_initDataProvider, _telemetryService, _contextService, _labelService, _logService, _environmentService, _productService, _layoutService) {
            super();
            this._initDataProvider = _initDataProvider;
            this._telemetryService = _telemetryService;
            this._contextService = _contextService;
            this._labelService = _labelService;
            this._logService = _logService;
            this._environmentService = _environmentService;
            this._productService = _productService;
            this._layoutService = _layoutService;
            this.kind = 1 /* LocalWebWorker */;
            this.remoteAuthority = null;
            this._onDidExit = this._register(new event_1.Emitter());
            this.onExit = this._onDidExit.event;
            this._isTerminating = false;
            this._protocolPromise = null;
            this._protocol = null;
            this._extensionHostLogsLocation = (0, resources_1.joinPath)(this._environmentService.extHostLogsPath, 'webWorker');
            this._extensionHostLogFile = (0, resources_1.joinPath)(this._extensionHostLogsLocation, `${extensions_1.ExtensionHostLogFileName}.log`);
        }
        _webWorkerExtensionHostIframeSrc() {
            if (this._environmentService.options && this._environmentService.options.webWorkerExtensionHostIframeSrc) {
                return this._environmentService.options.webWorkerExtensionHostIframeSrc;
            }
            if (this._productService.webEndpointUrl) {
                const forceHTTPS = (location.protocol === 'https:');
                let baseUrl = this._productService.webEndpointUrl;
                if (this._productService.quality) {
                    baseUrl += `/${this._productService.quality}`;
                }
                if (this._productService.commit) {
                    baseUrl += `/${this._productService.commit}`;
                }
                return (forceHTTPS
                    ? `${baseUrl}/out/vs/workbench/services/extensions/worker/httpsWebWorkerExtensionHostIframe.html`
                    : `${baseUrl}/out/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html`);
            }
            return null;
        }
        async start() {
            if (!this._protocolPromise) {
                if (platform.isWeb) {
                    const webWorkerExtensionHostIframeSrc = this._webWorkerExtensionHostIframeSrc();
                    if (webWorkerExtensionHostIframeSrc) {
                        this._protocolPromise = this._startInsideIframe(webWorkerExtensionHostIframeSrc);
                    }
                    else {
                        console.warn(`The web worker extension host is started without an iframe sandbox!`);
                        this._protocolPromise = this._startOutsideIframe();
                    }
                }
                else {
                    this._protocolPromise = this._startOutsideIframe();
                }
                this._protocolPromise.then(protocol => this._protocol = protocol);
            }
            return this._protocolPromise;
        }
        async _startInsideIframe(webWorkerExtensionHostIframeSrc) {
            const emitter = this._register(new event_1.Emitter());
            const iframe = document.createElement('iframe');
            iframe.setAttribute('class', 'web-worker-ext-host-iframe');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            iframe.style.display = 'none';
            const vscodeWebWorkerExtHostId = (0, uuid_1.generateUuid)();
            iframe.setAttribute('src', `${webWorkerExtensionHostIframeSrc}?vscodeWebWorkerExtHostId=${vscodeWebWorkerExtHostId}`);
            const barrier = new async_1.Barrier();
            let port;
            let barrierError = null;
            let barrierHasError = false;
            let startTimeout = null;
            const rejectBarrier = (exitCode, error) => {
                barrierError = error;
                barrierHasError = true;
                (0, errors_1.onUnexpectedError)(barrierError);
                clearTimeout(startTimeout);
                this._onDidExit.fire([81 /* UnexpectedError */, barrierError.message]);
                barrier.open();
            };
            const resolveBarrier = (messagePort) => {
                port = messagePort;
                clearTimeout(startTimeout);
                barrier.open();
            };
            startTimeout = setTimeout(() => {
                console.warn(`The Web Worker Extension Host did not start in 60s, that might be a problem.`);
            }, 60000);
            this._register(dom.addDisposableListener(window, 'message', (event) => {
                if (event.source !== iframe.contentWindow) {
                    return;
                }
                if (event.data.vscodeWebWorkerExtHostId !== vscodeWebWorkerExtHostId) {
                    return;
                }
                if (event.data.error) {
                    const { name, message, stack } = event.data.error;
                    const err = new Error();
                    err.message = message;
                    err.name = name;
                    err.stack = stack;
                    return rejectBarrier(81 /* UnexpectedError */, err);
                }
                const { data } = event.data;
                if (barrier.isOpen() || !(data instanceof MessagePort)) {
                    console.warn('UNEXPECTED message', event);
                    const err = new Error('UNEXPECTED message');
                    return rejectBarrier(81 /* UnexpectedError */, err);
                }
                resolveBarrier(data);
            }));
            this._layoutService.container.appendChild(iframe);
            this._register((0, lifecycle_1.toDisposable)(() => iframe.remove()));
            // await MessagePort and use it to directly communicate
            // with the worker extension host
            await barrier.wait();
            if (barrierHasError) {
                throw barrierError;
            }
            port.onmessage = (event) => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    this._onDidExit.fire([77, 'UNKNOWN data received']);
                    return;
                }
                emitter.fire(buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength)));
            };
            const protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                    port.postMessage(data, [data]);
                }
            };
            return this._performHandshake(protocol);
        }
        async _startOutsideIframe() {
            var _a;
            const emitter = new event_1.Emitter();
            const url = (0, defaultWorkerFactory_1.getWorkerBootstrapUrl)(network_1.FileAccess.asBrowserUri('../worker/extensionHostWorkerMain.js', require).toString(true), 'WorkerExtensionHost');
            const worker = new Worker((_a = ttPolicy === null || ttPolicy === void 0 ? void 0 : ttPolicy.createScriptURL(url)) !== null && _a !== void 0 ? _a : url, { name: 'WorkerExtensionHost' });
            const barrier = new async_1.Barrier();
            let port;
            const nestedWorker = new Map();
            worker.onmessage = (event) => {
                var _a;
                const data = event.data;
                if (data instanceof MessagePort) {
                    // receiving a message port which is used to communicate
                    // with the web worker extension host
                    if (barrier.isOpen()) {
                        console.warn('UNEXPECTED message', event);
                        this._onDidExit.fire([81 /* UnexpectedError */, 'received a message port AFTER opening the barrier']);
                        return;
                    }
                    port = data;
                    barrier.open();
                }
                else if ((data === null || data === void 0 ? void 0 : data.type) === '_newWorker') {
                    // receiving a message to create a new nested/child worker
                    const worker = new Worker(((_a = ttPolicyNestedWorker === null || ttPolicyNestedWorker === void 0 ? void 0 : ttPolicyNestedWorker.createScriptURL(data.url)) !== null && _a !== void 0 ? _a : data.url), data.options);
                    worker.postMessage(data.port, [data.port]);
                    worker.onerror = console.error.bind(console);
                    nestedWorker.set(data.id, worker);
                }
                else if ((data === null || data === void 0 ? void 0 : data.type) === '_terminateWorker') {
                    // receiving a message to terminate nested/child worker
                    if (nestedWorker.has(data.id)) {
                        nestedWorker.get(data.id).terminate();
                        nestedWorker.delete(data.id);
                    }
                }
                else {
                    // all other messages are an error
                    console.warn('UNEXPECTED message', event);
                    this._onDidExit.fire([81 /* UnexpectedError */, 'UNEXPECTED message']);
                }
            };
            // await MessagePort and use it to directly communicate
            // with the worker extension host
            await barrier.wait();
            port.onmessage = (event) => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    this._onDidExit.fire([77, 'UNKNOWN data received']);
                    return;
                }
                emitter.fire(buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength)));
            };
            worker.onerror = (event) => {
                console.error(event.message, event.error);
                this._onDidExit.fire([81 /* UnexpectedError */, event.message || event.error]);
            };
            // keep for cleanup
            this._register(emitter);
            this._register((0, lifecycle_1.toDisposable)(() => worker.terminate()));
            const protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                    port.postMessage(data, [data]);
                }
            };
            return this._performHandshake(protocol);
        }
        async _performHandshake(protocol) {
            // extension host handshake happens below
            // (1) <== wait for: Ready
            // (2) ==> send: init data
            // (3) <== wait for: Initialized
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* Ready */)));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(await this._createExtHostInitData())));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            await event_1.Event.toPromise(event_1.Event.filter(protocol.onMessage, msg => (0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* Initialized */)));
            if (this._isTerminating) {
                throw (0, errors_1.canceled)();
            }
            // Register log channel for web worker exthost log
            platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel({ id: 'webWorkerExtHostLog', label: (0, nls_1.localize)(0, null), file: this._extensionHostLogFile, log: true });
            return protocol;
        }
        dispose() {
            if (this._isTerminating) {
                return;
            }
            this._isTerminating = true;
            if (this._protocol) {
                this._protocol.send((0, extensionHostProtocol_1.createMessageOfType)(2 /* Terminate */));
            }
            super.dispose();
        }
        getInspectPort() {
            return undefined;
        }
        enableInspectPort() {
            return Promise.resolve(false);
        }
        async _createExtHostInitData() {
            const [telemetryInfo, initData] = await Promise.all([this._telemetryService.getTelemetryInfo(), this._initDataProvider.getInitData()]);
            const workspace = this._contextService.getWorkspace();
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                parentPid: -1,
                environment: {
                    isExtensionDevelopmentDebug: this._environmentService.debugRenderer,
                    appName: this._productService.nameLong,
                    appUriScheme: this._productService.urlProtocol,
                    appLanguage: platform.language,
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: this._environmentService.globalStorageHome,
                    workspaceStorageHome: this._environmentService.workspaceStorageHome,
                    webviewResourceRoot: this._environmentService.webviewResourceRoot,
                    webviewCspSource: this._environmentService.webviewCspSource,
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* EMPTY */ ? undefined : {
                    configuration: workspace.configuration || undefined,
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace)
                },
                resolvedExtensions: [],
                hostExtensions: [],
                extensions: initData.extensions,
                telemetryInfo,
                logLevel: this._logService.getLevel(),
                logsLocation: this._extensionHostLogsLocation,
                logFile: this._extensionHostLogFile,
                autoStart: initData.autoStart,
                remote: {
                    authority: this._environmentService.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                uiKind: platform.isWeb ? extHost_protocol_1.UIKind.Web : extHost_protocol_1.UIKind.Desktop
            };
        }
    };
    WebWorkerExtensionHost = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, label_1.ILabelService),
        __param(4, log_1.ILogService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, productService_1.IProductService),
        __param(7, layoutService_1.ILayoutService)
    ], WebWorkerExtensionHost);
    exports.WebWorkerExtensionHost = WebWorkerExtensionHost;
});
//# sourceMappingURL=webWorkerExtensionHost.js.map