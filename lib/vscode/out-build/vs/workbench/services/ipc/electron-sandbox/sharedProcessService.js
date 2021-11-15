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
define(["require", "exports", "vs/base/common/event", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/base/parts/ipc/common/ipc.mp", "vs/base/parts/ipc/common/ipc", "vs/platform/native/electron-sandbox/native", "vs/base/common/uuid", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/platform/ipc/electron-sandbox/services", "vs/base/common/performance", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/extensions", "vs/base/common/async"], function (require, exports, event_1, globals_1, ipc_mp_1, ipc_1, native_1, uuid_1, log_1, lifecycle_1, services_1, performance_1, lifecycle_2, extensions_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcessService = void 0;
    let SharedProcessService = class SharedProcessService extends lifecycle_1.Disposable {
        constructor(nativeHostService, logService, lifecycleService) {
            super();
            this.nativeHostService = nativeHostService;
            this.logService = logService;
            this.lifecycleService = lifecycleService;
            this.withSharedProcessConnection = this.connect();
        }
        async connect() {
            this.logService.trace('Renderer->SharedProcess#connect');
            // Our performance tests show that a connection to the shared
            // process can have significant overhead to the startup time
            // of the window because the shared process could be created
            // as a result. As such, make sure we await the `Restored`
            // phase before making a connection attempt, but also add a
            // timeout to be safe against possible deadlocks.
            // TODO@sandbox revisit this when the shared process connection
            // is more cruicial.
            await Promise.race([this.lifecycleService.when(3 /* Restored */), (0, async_1.timeout)(2000)]);
            (0, performance_1.mark)('code/willConnectSharedProcess');
            // Ask to create message channel inside the window
            // and send over a UUID to correlate the response
            const nonce = (0, uuid_1.generateUuid)();
            globals_1.ipcMessagePort.connect('vscode:createSharedProcessMessageChannel', 'vscode:createSharedProcessMessageChannelResult', nonce);
            // Wait until the main side has returned the `MessagePort`
            // We need to filter by the `nonce` to ensure we listen
            // to the right response.
            const onMessageChannelResult = event_1.Event.fromDOMEventEmitter(window, 'message', (e) => ({ nonce: e.data, port: e.ports[0], source: e.source }));
            const { port } = await event_1.Event.toPromise(event_1.Event.once(event_1.Event.filter(onMessageChannelResult, e => e.nonce === nonce && e.source === window)));
            (0, performance_1.mark)('code/didConnectSharedProcess');
            this.logService.trace('Renderer->SharedProcess#connect: connection established');
            return this._register(new ipc_mp_1.Client(port, `window:${this.nativeHostService.windowId}`));
        }
        getChannel(channelName) {
            return (0, ipc_1.getDelayedChannel)(this.withSharedProcessConnection.then(connection => connection.getChannel(channelName)));
        }
        registerChannel(channelName, channel) {
            this.withSharedProcessConnection.then(connection => connection.registerChannel(channelName, channel));
        }
    };
    SharedProcessService = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, log_1.ILogService),
        __param(2, lifecycle_2.ILifecycleService)
    ], SharedProcessService);
    exports.SharedProcessService = SharedProcessService;
    (0, extensions_1.registerSingleton)(services_1.ISharedProcessService, SharedProcessService, true);
});
//# sourceMappingURL=sharedProcessService.js.map