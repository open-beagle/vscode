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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event", "vs/base/common/lifecycle", "../common/extHost.protocol", "vs/workbench/api/common/extHostCustomers", "vs/workbench/services/decorations/browser/decorations", "vs/base/common/cancellation"], function (require, exports, uri_1, event_1, lifecycle_1, extHost_protocol_1, extHostCustomers_1, decorations_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDecorations = void 0;
    class DecorationRequestsQueue {
        constructor(_proxy, _handle) {
            this._proxy = _proxy;
            this._handle = _handle;
            this._idPool = 0;
            this._requests = new Map();
            this._resolver = new Map();
            //
        }
        enqueue(uri, token) {
            const id = ++this._idPool;
            const result = new Promise(resolve => {
                this._requests.set(id, { id, uri });
                this._resolver.set(id, resolve);
                this._processQueue();
            });
            token.onCancellationRequested(() => {
                this._requests.delete(id);
                this._resolver.delete(id);
            });
            return result;
        }
        _processQueue() {
            if (typeof this._timer === 'number') {
                // already queued
                return;
            }
            this._timer = setTimeout(() => {
                // make request
                const requests = this._requests;
                const resolver = this._resolver;
                this._proxy.$provideDecorations(this._handle, [...requests.values()], cancellation_1.CancellationToken.None).then(data => {
                    for (let [id, resolve] of resolver) {
                        resolve(data[id]);
                    }
                });
                // reset
                this._requests = new Map();
                this._resolver = new Map();
                this._timer = undefined;
            }, 0);
        }
    }
    let MainThreadDecorations = class MainThreadDecorations {
        constructor(context, _decorationsService) {
            this._decorationsService = _decorationsService;
            this._provider = new Map();
            this._proxy = context.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDecorations);
        }
        dispose() {
            this._provider.forEach(value => (0, lifecycle_1.dispose)(value));
            this._provider.clear();
        }
        $registerDecorationProvider(handle, label) {
            const emitter = new event_1.Emitter();
            const queue = new DecorationRequestsQueue(this._proxy, handle);
            const registration = this._decorationsService.registerDecorationsProvider({
                label,
                onDidChange: emitter.event,
                provideDecorations: async (uri, token) => {
                    const data = await queue.enqueue(uri, token);
                    if (!data) {
                        return undefined;
                    }
                    const [bubble, tooltip, letter, themeColor] = data;
                    return {
                        weight: 10,
                        bubble: bubble !== null && bubble !== void 0 ? bubble : false,
                        color: themeColor === null || themeColor === void 0 ? void 0 : themeColor.id,
                        tooltip,
                        letter
                    };
                }
            });
            this._provider.set(handle, [emitter, registration]);
        }
        $onDidChange(handle, resources) {
            const provider = this._provider.get(handle);
            if (provider) {
                const [emitter] = provider;
                emitter.fire(resources && resources.map(r => uri_1.URI.revive(r)));
            }
        }
        $unregisterDecorationProvider(handle) {
            const provider = this._provider.get(handle);
            if (provider) {
                (0, lifecycle_1.dispose)(provider);
                this._provider.delete(handle);
            }
        }
    };
    MainThreadDecorations = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadDecorations),
        __param(1, decorations_1.IDecorationsService)
    ], MainThreadDecorations);
    exports.MainThreadDecorations = MainThreadDecorations;
});
//# sourceMappingURL=mainThreadDecorations.js.map