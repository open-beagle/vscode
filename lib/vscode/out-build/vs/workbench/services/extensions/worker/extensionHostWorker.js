/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/event", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/services/extensions/common/extensionHostMain", "vs/workbench/services/extensions/worker/polyfillNestedWorker", "vs/base/common/path", "vs/base/common/performance", "vs/workbench/api/common/extHost.common.services", "vs/workbench/api/worker/extHost.worker.services"], function (require, exports, buffer_1, event_1, extensionHostProtocol_1, extensionHostMain_1, polyfillNestedWorker_1, path, performance) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    const nativeClose = self.close.bind(self);
    self.close = () => console.trace(`'close' has been blocked`);
    const nativePostMessage = postMessage.bind(self);
    self.postMessage = () => console.trace(`'postMessage' has been blocked`);
    // const nativeAddEventListener = addEventListener.bind(self);
    self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);
    self['AMDLoader'] = undefined;
    self['NLSLoaderPlugin'] = undefined;
    self['define'] = undefined;
    self['require'] = undefined;
    self['webkitRequestFileSystem'] = undefined;
    self['webkitRequestFileSystemSync'] = undefined;
    self['webkitResolveLocalFileSystemSyncURL'] = undefined;
    self['webkitResolveLocalFileSystemURL'] = undefined;
    if (self.Worker) {
        const ttPolicy = (_a = self.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('extensionHostWorker', { createScriptURL: (value) => value });
        // make sure new Worker(...) always uses blob: (to maintain current origin)
        const _Worker = self.Worker;
        Worker = function (stringUrl, options) {
            const js = `importScripts('${stringUrl}');`;
            options = options || {};
            options.name = options.name || path.basename(stringUrl.toString());
            const blob = new Blob([js], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);
            return new _Worker(ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl, options);
        };
    }
    else {
        self.Worker = class extends polyfillNestedWorker_1.NestedWorker {
            constructor(stringOrUrl, options) {
                super(nativePostMessage, stringOrUrl, Object.assign({ name: path.basename(stringOrUrl.toString()) }, options));
            }
        };
    }
    //#endregion ---
    const hostUtil = new class {
        exit(_code) {
            nativeClose();
        }
        async exists(_path) {
            return true;
        }
        async realpath(path) {
            return path;
        }
    };
    class ExtensionWorker {
        constructor() {
            const channel = new MessageChannel();
            const emitter = new event_1.Emitter();
            let terminating = false;
            // send over port2, keep port1
            nativePostMessage(channel.port2, [channel.port2]);
            channel.port1.onmessage = event => {
                const { data } = event;
                if (!(data instanceof ArrayBuffer)) {
                    console.warn('UNKNOWN data received', data);
                    return;
                }
                const msg = buffer_1.VSBuffer.wrap(new Uint8Array(data, 0, data.byteLength));
                if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 2 /* Terminate */)) {
                    // handle terminate-message right here
                    terminating = true;
                    onTerminate('received terminate message from renderer');
                    return;
                }
                // emit non-terminate messages to the outside
                emitter.fire(msg);
            };
            this.protocol = {
                onMessage: emitter.event,
                send: vsbuf => {
                    if (!terminating) {
                        const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                        channel.port1.postMessage(data, [data]);
                    }
                }
            };
        }
    }
    function connectToRenderer(protocol) {
        return new Promise(resolve => {
            const once = protocol.onMessage(raw => {
                once.dispose();
                const initData = JSON.parse(raw.toString());
                protocol.send((0, extensionHostProtocol_1.createMessageOfType)(0 /* Initialized */));
                resolve({ protocol, initData });
            });
            protocol.send((0, extensionHostProtocol_1.createMessageOfType)(1 /* Ready */));
        });
    }
    let onTerminate = (reason) => nativeClose();
    (function create() {
        const res = new ExtensionWorker();
        performance.mark(`code/extHost/willConnectToRenderer`);
        connectToRenderer(res.protocol).then(data => {
            performance.mark(`code/extHost/didWaitForInitData`);
            const extHostMain = new extensionHostMain_1.ExtensionHostMain(data.protocol, data.initData, hostUtil, null);
            onTerminate = (reason) => extHostMain.terminate(reason);
        });
    })();
});
//# sourceMappingURL=extensionHostWorker.js.map