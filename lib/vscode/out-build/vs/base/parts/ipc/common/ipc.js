/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/buffer", "vs/base/common/arrays", "vs/base/common/types", "vs/base/common/marshalling", "vs/base/common/strings"], function (require, exports, event_1, lifecycle_1, async_1, cancellation_1, errors, buffer_1, arrays_1, types_1, marshalling_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IPCLogger = exports.logWithColors = exports.ProxyChannel = exports.StaticRouter = exports.getNextTickChannel = exports.getDelayedChannel = exports.IPCClient = exports.IPCServer = exports.ChannelClient = exports.RequestInitiator = exports.ChannelServer = exports.ResponseType = exports.RequestType = void 0;
    var RequestType;
    (function (RequestType) {
        RequestType[RequestType["Promise"] = 100] = "Promise";
        RequestType[RequestType["PromiseCancel"] = 101] = "PromiseCancel";
        RequestType[RequestType["EventListen"] = 102] = "EventListen";
        RequestType[RequestType["EventDispose"] = 103] = "EventDispose";
    })(RequestType = exports.RequestType || (exports.RequestType = {}));
    function requestTypeToStr(type) {
        switch (type) {
            case 100 /* Promise */:
                return 'req';
            case 101 /* PromiseCancel */:
                return 'cancel';
            case 102 /* EventListen */:
                return 'subscribe';
            case 103 /* EventDispose */:
                return 'unsubscribe';
        }
    }
    var ResponseType;
    (function (ResponseType) {
        ResponseType[ResponseType["Initialize"] = 200] = "Initialize";
        ResponseType[ResponseType["PromiseSuccess"] = 201] = "PromiseSuccess";
        ResponseType[ResponseType["PromiseError"] = 202] = "PromiseError";
        ResponseType[ResponseType["PromiseErrorObj"] = 203] = "PromiseErrorObj";
        ResponseType[ResponseType["EventFire"] = 204] = "EventFire";
    })(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
    function responseTypeToStr(type) {
        switch (type) {
            case 200 /* Initialize */:
                return `init`;
            case 201 /* PromiseSuccess */:
                return `reply:`;
            case 202 /* PromiseError */:
            case 203 /* PromiseErrorObj */:
                return `replyErr:`;
            case 204 /* EventFire */:
                return `event:`;
        }
    }
    var State;
    (function (State) {
        State[State["Uninitialized"] = 0] = "Uninitialized";
        State[State["Idle"] = 1] = "Idle";
    })(State || (State = {}));
    class BufferReader {
        constructor(buffer) {
            this.buffer = buffer;
            this.pos = 0;
        }
        read(bytes) {
            const result = this.buffer.slice(this.pos, this.pos + bytes);
            this.pos += result.byteLength;
            return result;
        }
    }
    class BufferWriter {
        constructor() {
            this.buffers = [];
        }
        get buffer() {
            return buffer_1.VSBuffer.concat(this.buffers);
        }
        write(buffer) {
            this.buffers.push(buffer);
        }
    }
    var DataType;
    (function (DataType) {
        DataType[DataType["Undefined"] = 0] = "Undefined";
        DataType[DataType["String"] = 1] = "String";
        DataType[DataType["Buffer"] = 2] = "Buffer";
        DataType[DataType["VSBuffer"] = 3] = "VSBuffer";
        DataType[DataType["Array"] = 4] = "Array";
        DataType[DataType["Object"] = 5] = "Object";
    })(DataType || (DataType = {}));
    function createSizeBuffer(size) {
        const result = buffer_1.VSBuffer.alloc(4);
        result.writeUInt32BE(size, 0);
        return result;
    }
    function readSizeBuffer(reader) {
        return reader.read(4).readUInt32BE(0);
    }
    function createOneByteBuffer(value) {
        const result = buffer_1.VSBuffer.alloc(1);
        result.writeUInt8(value, 0);
        return result;
    }
    const BufferPresets = {
        Undefined: createOneByteBuffer(DataType.Undefined),
        String: createOneByteBuffer(DataType.String),
        Buffer: createOneByteBuffer(DataType.Buffer),
        VSBuffer: createOneByteBuffer(DataType.VSBuffer),
        Array: createOneByteBuffer(DataType.Array),
        Object: createOneByteBuffer(DataType.Object),
    };
    const hasBuffer = (typeof Buffer !== 'undefined');
    function serialize(writer, data) {
        if (typeof data === 'undefined') {
            writer.write(BufferPresets.Undefined);
        }
        else if (typeof data === 'string') {
            const buffer = buffer_1.VSBuffer.fromString(data);
            writer.write(BufferPresets.String);
            writer.write(createSizeBuffer(buffer.byteLength));
            writer.write(buffer);
        }
        else if (hasBuffer && Buffer.isBuffer(data)) {
            const buffer = buffer_1.VSBuffer.wrap(data);
            writer.write(BufferPresets.Buffer);
            writer.write(createSizeBuffer(buffer.byteLength));
            writer.write(buffer);
        }
        else if (data instanceof buffer_1.VSBuffer) {
            writer.write(BufferPresets.VSBuffer);
            writer.write(createSizeBuffer(data.byteLength));
            writer.write(data);
        }
        else if (Array.isArray(data)) {
            writer.write(BufferPresets.Array);
            writer.write(createSizeBuffer(data.length));
            for (const el of data) {
                serialize(writer, el);
            }
        }
        else {
            const buffer = buffer_1.VSBuffer.fromString(JSON.stringify(data));
            writer.write(BufferPresets.Object);
            writer.write(createSizeBuffer(buffer.byteLength));
            writer.write(buffer);
        }
    }
    function deserialize(reader) {
        const type = reader.read(1).readUInt8(0);
        switch (type) {
            case DataType.Undefined: return undefined;
            case DataType.String: return reader.read(readSizeBuffer(reader)).toString();
            case DataType.Buffer: return reader.read(readSizeBuffer(reader)).buffer;
            case DataType.VSBuffer: return reader.read(readSizeBuffer(reader));
            case DataType.Array: {
                const length = readSizeBuffer(reader);
                const result = [];
                for (let i = 0; i < length; i++) {
                    result.push(deserialize(reader));
                }
                return result;
            }
            case DataType.Object: return JSON.parse(reader.read(readSizeBuffer(reader)).toString());
        }
    }
    class ChannelServer {
        constructor(protocol, ctx, logger = null, timeoutDelay = 1000) {
            this.protocol = protocol;
            this.ctx = ctx;
            this.logger = logger;
            this.timeoutDelay = timeoutDelay;
            this.channels = new Map();
            this.activeRequests = new Map();
            // Requests might come in for channels which are not yet registered.
            // They will timeout after `timeoutDelay`.
            this.pendingRequests = new Map();
            this.protocolListener = this.protocol.onMessage(msg => this.onRawMessage(msg));
            this.sendResponse({ type: 200 /* Initialize */ });
        }
        registerChannel(channelName, channel) {
            this.channels.set(channelName, channel);
            // https://github.com/microsoft/vscode/issues/72531
            setTimeout(() => this.flushPendingRequests(channelName), 0);
        }
        sendResponse(response) {
            switch (response.type) {
                case 200 /* Initialize */: {
                    const msgLength = this.send([response.type]);
                    if (this.logger) {
                        this.logger.logOutgoing(msgLength, 0, 1 /* OtherSide */, responseTypeToStr(response.type));
                    }
                    return;
                }
                case 201 /* PromiseSuccess */:
                case 202 /* PromiseError */:
                case 204 /* EventFire */:
                case 203 /* PromiseErrorObj */: {
                    const msgLength = this.send([response.type, response.id], response.data);
                    if (this.logger) {
                        this.logger.logOutgoing(msgLength, response.id, 1 /* OtherSide */, responseTypeToStr(response.type), response.data);
                    }
                    return;
                }
            }
        }
        send(header, body = undefined) {
            const writer = new BufferWriter();
            serialize(writer, header);
            serialize(writer, body);
            return this.sendBuffer(writer.buffer);
        }
        sendBuffer(message) {
            try {
                this.protocol.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        onRawMessage(message) {
            const reader = new BufferReader(message);
            const header = deserialize(reader);
            const body = deserialize(reader);
            const type = header[0];
            switch (type) {
                case 100 /* Promise */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, header[1], 1 /* OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    }
                    return this.onPromise({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 102 /* EventListen */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, header[1], 1 /* OtherSide */, `${requestTypeToStr(type)}: ${header[2]}.${header[3]}`, body);
                    }
                    return this.onEventListen({ type, id: header[1], channelName: header[2], name: header[3], arg: body });
                case 101 /* PromiseCancel */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, header[1], 1 /* OtherSide */, `${requestTypeToStr(type)}`);
                    }
                    return this.disposeActiveRequest({ type, id: header[1] });
                case 103 /* EventDispose */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, header[1], 1 /* OtherSide */, `${requestTypeToStr(type)}`);
                    }
                    return this.disposeActiveRequest({ type, id: header[1] });
            }
        }
        onPromise(request) {
            const channel = this.channels.get(request.channelName);
            if (!channel) {
                this.collectPendingRequest(request);
                return;
            }
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            let promise;
            try {
                promise = channel.call(this.ctx, request.name, request.arg, cancellationTokenSource.token);
            }
            catch (err) {
                promise = Promise.reject(err);
            }
            const id = request.id;
            promise.then(data => {
                this.sendResponse({ id, data, type: 201 /* PromiseSuccess */ });
                this.activeRequests.delete(request.id);
            }, err => {
                if (err instanceof Error) {
                    this.sendResponse({
                        id, data: {
                            message: err.message,
                            name: err.name,
                            stack: err.stack ? (err.stack.split ? err.stack.split('\n') : err.stack) : undefined
                        }, type: 202 /* PromiseError */
                    });
                }
                else {
                    this.sendResponse({ id, data: err, type: 203 /* PromiseErrorObj */ });
                }
                this.activeRequests.delete(request.id);
            });
            const disposable = (0, lifecycle_1.toDisposable)(() => cancellationTokenSource.cancel());
            this.activeRequests.set(request.id, disposable);
        }
        onEventListen(request) {
            const channel = this.channels.get(request.channelName);
            if (!channel) {
                this.collectPendingRequest(request);
                return;
            }
            const id = request.id;
            const event = channel.listen(this.ctx, request.name, request.arg);
            const disposable = event(data => this.sendResponse({ id, data, type: 204 /* EventFire */ }));
            this.activeRequests.set(request.id, disposable);
        }
        disposeActiveRequest(request) {
            const disposable = this.activeRequests.get(request.id);
            if (disposable) {
                disposable.dispose();
                this.activeRequests.delete(request.id);
            }
        }
        collectPendingRequest(request) {
            let pendingRequests = this.pendingRequests.get(request.channelName);
            if (!pendingRequests) {
                pendingRequests = [];
                this.pendingRequests.set(request.channelName, pendingRequests);
            }
            const timer = setTimeout(() => {
                console.error(`Unknown channel: ${request.channelName}`);
                if (request.type === 100 /* Promise */) {
                    this.sendResponse({
                        id: request.id,
                        data: { name: 'Unknown channel', message: `Channel name '${request.channelName}' timed out after ${this.timeoutDelay}ms`, stack: undefined },
                        type: 202 /* PromiseError */
                    });
                }
            }, this.timeoutDelay);
            pendingRequests.push({ request, timeoutTimer: timer });
        }
        flushPendingRequests(channelName) {
            const requests = this.pendingRequests.get(channelName);
            if (requests) {
                for (const request of requests) {
                    clearTimeout(request.timeoutTimer);
                    switch (request.request.type) {
                        case 100 /* Promise */:
                            this.onPromise(request.request);
                            break;
                        case 102 /* EventListen */:
                            this.onEventListen(request.request);
                            break;
                    }
                }
                this.pendingRequests.delete(channelName);
            }
        }
        dispose() {
            if (this.protocolListener) {
                this.protocolListener.dispose();
                this.protocolListener = null;
            }
            this.activeRequests.forEach(d => d.dispose());
            this.activeRequests.clear();
        }
    }
    exports.ChannelServer = ChannelServer;
    var RequestInitiator;
    (function (RequestInitiator) {
        RequestInitiator[RequestInitiator["LocalSide"] = 0] = "LocalSide";
        RequestInitiator[RequestInitiator["OtherSide"] = 1] = "OtherSide";
    })(RequestInitiator = exports.RequestInitiator || (exports.RequestInitiator = {}));
    class ChannelClient {
        constructor(protocol, logger = null) {
            this.protocol = protocol;
            this.isDisposed = false;
            this.state = State.Uninitialized;
            this.activeRequests = new Set();
            this.handlers = new Map();
            this.lastRequestId = 0;
            this._onDidInitialize = new event_1.Emitter();
            this.onDidInitialize = this._onDidInitialize.event;
            this.protocolListener = this.protocol.onMessage(msg => this.onBuffer(msg));
            this.logger = logger;
        }
        getChannel(channelName) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    if (that.isDisposed) {
                        return Promise.reject(errors.canceled());
                    }
                    return that.requestPromise(channelName, command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if (that.isDisposed) {
                        return Promise.reject(errors.canceled());
                    }
                    return that.requestEvent(channelName, event, arg);
                }
            };
        }
        requestPromise(channelName, name, arg, cancellationToken = cancellation_1.CancellationToken.None) {
            const id = this.lastRequestId++;
            const type = 100 /* Promise */;
            const request = { id, type, channelName, name, arg };
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(errors.canceled());
            }
            let disposable;
            const result = new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e(errors.canceled());
                }
                const doRequest = () => {
                    const handler = response => {
                        switch (response.type) {
                            case 201 /* PromiseSuccess */:
                                this.handlers.delete(id);
                                c(response.data);
                                break;
                            case 202 /* PromiseError */:
                                this.handlers.delete(id);
                                const error = new Error(response.data.message);
                                error.stack = response.data.stack;
                                error.name = response.data.name;
                                e(error);
                                break;
                            case 203 /* PromiseErrorObj */:
                                this.handlers.delete(id);
                                e(response.data);
                                break;
                        }
                    };
                    this.handlers.set(id, handler);
                    this.sendRequest(request);
                };
                let uninitializedPromise = null;
                if (this.state === State.Idle) {
                    doRequest();
                }
                else {
                    uninitializedPromise = (0, async_1.createCancelablePromise)(_ => this.whenInitialized());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        doRequest();
                    });
                }
                const cancel = () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.sendRequest({ id, type: 101 /* PromiseCancel */ });
                    }
                    e(errors.canceled());
                };
                const cancellationTokenListener = cancellationToken.onCancellationRequested(cancel);
                disposable = (0, lifecycle_1.combinedDisposable)((0, lifecycle_1.toDisposable)(cancel), cancellationTokenListener);
                this.activeRequests.add(disposable);
            });
            return result.finally(() => { this.activeRequests.delete(disposable); });
        }
        requestEvent(channelName, name, arg) {
            const id = this.lastRequestId++;
            const type = 102 /* EventListen */;
            const request = { id, type, channelName, name, arg };
            let uninitializedPromise = null;
            const emitter = new event_1.Emitter({
                onFirstListenerAdd: () => {
                    uninitializedPromise = (0, async_1.createCancelablePromise)(_ => this.whenInitialized());
                    uninitializedPromise.then(() => {
                        uninitializedPromise = null;
                        this.activeRequests.add(emitter);
                        this.sendRequest(request);
                    });
                },
                onLastListenerRemove: () => {
                    if (uninitializedPromise) {
                        uninitializedPromise.cancel();
                        uninitializedPromise = null;
                    }
                    else {
                        this.activeRequests.delete(emitter);
                        this.sendRequest({ id, type: 103 /* EventDispose */ });
                    }
                }
            });
            const handler = (res) => emitter.fire(res.data);
            this.handlers.set(id, handler);
            return emitter.event;
        }
        sendRequest(request) {
            switch (request.type) {
                case 100 /* Promise */:
                case 102 /* EventListen */: {
                    const msgLength = this.send([request.type, request.id, request.channelName, request.name], request.arg);
                    if (this.logger) {
                        this.logger.logOutgoing(msgLength, request.id, 0 /* LocalSide */, `${requestTypeToStr(request.type)}: ${request.channelName}.${request.name}`, request.arg);
                    }
                    return;
                }
                case 101 /* PromiseCancel */:
                case 103 /* EventDispose */: {
                    const msgLength = this.send([request.type, request.id]);
                    if (this.logger) {
                        this.logger.logOutgoing(msgLength, request.id, 0 /* LocalSide */, requestTypeToStr(request.type));
                    }
                    return;
                }
            }
        }
        send(header, body = undefined) {
            const writer = new BufferWriter();
            serialize(writer, header);
            serialize(writer, body);
            return this.sendBuffer(writer.buffer);
        }
        sendBuffer(message) {
            try {
                this.protocol.send(message);
                return message.byteLength;
            }
            catch (err) {
                // noop
                return 0;
            }
        }
        onBuffer(message) {
            const reader = new BufferReader(message);
            const header = deserialize(reader);
            const body = deserialize(reader);
            const type = header[0];
            switch (type) {
                case 200 /* Initialize */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, 0, 0 /* LocalSide */, responseTypeToStr(type));
                    }
                    return this.onResponse({ type: header[0] });
                case 201 /* PromiseSuccess */:
                case 202 /* PromiseError */:
                case 204 /* EventFire */:
                case 203 /* PromiseErrorObj */:
                    if (this.logger) {
                        this.logger.logIncoming(message.byteLength, header[1], 0 /* LocalSide */, responseTypeToStr(type), body);
                    }
                    return this.onResponse({ type: header[0], id: header[1], data: body });
            }
        }
        onResponse(response) {
            if (response.type === 200 /* Initialize */) {
                this.state = State.Idle;
                this._onDidInitialize.fire();
                return;
            }
            const handler = this.handlers.get(response.id);
            if (handler) {
                handler(response);
            }
        }
        whenInitialized() {
            if (this.state === State.Idle) {
                return Promise.resolve();
            }
            else {
                return event_1.Event.toPromise(this.onDidInitialize);
            }
        }
        dispose() {
            this.isDisposed = true;
            if (this.protocolListener) {
                this.protocolListener.dispose();
                this.protocolListener = null;
            }
            this.activeRequests.forEach(p => p.dispose());
            this.activeRequests.clear();
        }
    }
    exports.ChannelClient = ChannelClient;
    /**
     * An `IPCServer` is both a channel server and a routing channel
     * client.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCClient` classes to get IPC implementations
     * for your protocol.
     */
    class IPCServer {
        constructor(onDidClientConnect) {
            this.channels = new Map();
            this._connections = new Set();
            this._onDidAddConnection = new event_1.Emitter();
            this.onDidAddConnection = this._onDidAddConnection.event;
            this._onDidRemoveConnection = new event_1.Emitter();
            this.onDidRemoveConnection = this._onDidRemoveConnection.event;
            onDidClientConnect(({ protocol, onDidClientDisconnect }) => {
                const onFirstMessage = event_1.Event.once(protocol.onMessage);
                onFirstMessage(msg => {
                    const reader = new BufferReader(msg);
                    const ctx = deserialize(reader);
                    const channelServer = new ChannelServer(protocol, ctx);
                    const channelClient = new ChannelClient(protocol);
                    this.channels.forEach((channel, name) => channelServer.registerChannel(name, channel));
                    const connection = { channelServer, channelClient, ctx };
                    this._connections.add(connection);
                    this._onDidAddConnection.fire(connection);
                    onDidClientDisconnect(() => {
                        channelServer.dispose();
                        channelClient.dispose();
                        this._connections.delete(connection);
                        this._onDidRemoveConnection.fire(connection);
                    });
                });
            });
        }
        get connections() {
            const result = [];
            this._connections.forEach(ctx => result.push(ctx));
            return result;
        }
        getChannel(channelName, routerOrClientFilter) {
            const that = this;
            return {
                call(command, arg, cancellationToken) {
                    let connectionPromise;
                    if ((0, types_1.isFunction)(routerOrClientFilter)) {
                        // when no router is provided, we go random client picking
                        let connection = (0, arrays_1.getRandomElement)(that.connections.filter(routerOrClientFilter));
                        connectionPromise = connection
                            // if we found a client, let's call on it
                            ? Promise.resolve(connection)
                            // else, let's wait for a client to come along
                            : event_1.Event.toPromise(event_1.Event.filter(that.onDidAddConnection, routerOrClientFilter));
                    }
                    else {
                        connectionPromise = routerOrClientFilter.routeCall(that, command, arg);
                    }
                    const channelPromise = connectionPromise
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return getDelayedChannel(channelPromise)
                        .call(command, arg, cancellationToken);
                },
                listen(event, arg) {
                    if ((0, types_1.isFunction)(routerOrClientFilter)) {
                        return that.getMulticastEvent(channelName, routerOrClientFilter, event, arg);
                    }
                    const channelPromise = routerOrClientFilter.routeEvent(that, event, arg)
                        .then(connection => connection.channelClient.getChannel(channelName));
                    return getDelayedChannel(channelPromise)
                        .listen(event, arg);
                }
            };
        }
        getMulticastEvent(channelName, clientFilter, eventName, arg) {
            const that = this;
            let disposables = new lifecycle_1.DisposableStore();
            // Create an emitter which hooks up to all clients
            // as soon as first listener is added. It also
            // disconnects from all clients as soon as the last listener
            // is removed.
            const emitter = new event_1.Emitter({
                onFirstListenerAdd: () => {
                    disposables = new lifecycle_1.DisposableStore();
                    // The event multiplexer is useful since the active
                    // client list is dynamic. We need to hook up and disconnection
                    // to/from clients as they come and go.
                    const eventMultiplexer = new event_1.EventMultiplexer();
                    const map = new Map();
                    const onDidAddConnection = (connection) => {
                        const channel = connection.channelClient.getChannel(channelName);
                        const event = channel.listen(eventName, arg);
                        const disposable = eventMultiplexer.add(event);
                        map.set(connection, disposable);
                    };
                    const onDidRemoveConnection = (connection) => {
                        const disposable = map.get(connection);
                        if (!disposable) {
                            return;
                        }
                        disposable.dispose();
                        map.delete(connection);
                    };
                    that.connections.filter(clientFilter).forEach(onDidAddConnection);
                    event_1.Event.filter(that.onDidAddConnection, clientFilter)(onDidAddConnection, undefined, disposables);
                    that.onDidRemoveConnection(onDidRemoveConnection, undefined, disposables);
                    eventMultiplexer.event(emitter.fire, emitter, disposables);
                    disposables.add(eventMultiplexer);
                },
                onLastListenerRemove: () => {
                    disposables.dispose();
                }
            });
            return emitter.event;
        }
        registerChannel(channelName, channel) {
            this.channels.set(channelName, channel);
            this._connections.forEach(connection => {
                connection.channelServer.registerChannel(channelName, channel);
            });
        }
        dispose() {
            this.channels.clear();
            this._connections.clear();
            this._onDidAddConnection.dispose();
            this._onDidRemoveConnection.dispose();
        }
    }
    exports.IPCServer = IPCServer;
    /**
     * An `IPCClient` is both a channel client and a channel server.
     *
     * As the owner of a protocol, you should extend both this
     * and the `IPCClient` classes to get IPC implementations
     * for your protocol.
     */
    class IPCClient {
        constructor(protocol, ctx, ipcLogger = null) {
            const writer = new BufferWriter();
            serialize(writer, ctx);
            protocol.send(writer.buffer);
            this.channelClient = new ChannelClient(protocol, ipcLogger);
            this.channelServer = new ChannelServer(protocol, ctx, ipcLogger);
        }
        getChannel(channelName) {
            return this.channelClient.getChannel(channelName);
        }
        registerChannel(channelName, channel) {
            this.channelServer.registerChannel(channelName, channel);
        }
        dispose() {
            this.channelClient.dispose();
            this.channelServer.dispose();
        }
    }
    exports.IPCClient = IPCClient;
    function getDelayedChannel(promise) {
        return {
            call(command, arg, cancellationToken) {
                return promise.then(c => c.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                const relay = new event_1.Relay();
                promise.then(c => relay.input = c.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.getDelayedChannel = getDelayedChannel;
    function getNextTickChannel(channel) {
        let didTick = false;
        return {
            call(command, arg, cancellationToken) {
                if (didTick) {
                    return channel.call(command, arg, cancellationToken);
                }
                return (0, async_1.timeout)(0)
                    .then(() => didTick = true)
                    .then(() => channel.call(command, arg, cancellationToken));
            },
            listen(event, arg) {
                if (didTick) {
                    return channel.listen(event, arg);
                }
                const relay = new event_1.Relay();
                (0, async_1.timeout)(0)
                    .then(() => didTick = true)
                    .then(() => relay.input = channel.listen(event, arg));
                return relay.event;
            }
        };
    }
    exports.getNextTickChannel = getNextTickChannel;
    class StaticRouter {
        constructor(fn) {
            this.fn = fn;
        }
        routeCall(hub) {
            return this.route(hub);
        }
        routeEvent(hub) {
            return this.route(hub);
        }
        async route(hub) {
            for (const connection of hub.connections) {
                if (await Promise.resolve(this.fn(connection.ctx))) {
                    return Promise.resolve(connection);
                }
            }
            await event_1.Event.toPromise(hub.onDidAddConnection);
            return await this.route(hub);
        }
    }
    exports.StaticRouter = StaticRouter;
    /**
     * Use ProxyChannels to automatically wrapping and unwrapping
     * services to/from IPC channels, instead of manually wrapping
     * each service method and event.
     *
     * Restrictions:
     * - If marshalling is enabled, only `URI` and `RegExp` is converted
     *   automatically for you
     * - Events must follow the naming convention `onUpperCase`
     * - `CancellationToken` is currently not supported
     * - If a context is provided, you can use `AddFirstParameterToFunctions`
     *   utility to signal this in the receiving side type
     */
    var ProxyChannel;
    (function (ProxyChannel) {
        function fromService(service, options) {
            const handler = service;
            const disableMarshalling = options && options.disableMarshalling;
            // Buffer any event that should be supported by
            // iterating over all property keys and finding them
            const mapEventNameToEvent = new Map();
            for (const key in handler) {
                if (propertyIsEvent(key)) {
                    mapEventNameToEvent.set(key, event_1.Event.buffer(handler[key], true));
                }
            }
            return new class {
                listen(_, event) {
                    const eventImpl = mapEventNameToEvent.get(event);
                    if (eventImpl) {
                        return eventImpl;
                    }
                    throw new Error(`Event not found: ${event}`);
                }
                call(_, command, args) {
                    const target = handler[command];
                    if (typeof target === 'function') {
                        // Revive unless marshalling disabled
                        if (!disableMarshalling && Array.isArray(args)) {
                            for (let i = 0; i < args.length; i++) {
                                args[i] = (0, marshalling_1.revive)(args[i]);
                            }
                        }
                        return target.apply(handler, args);
                    }
                    throw new Error(`Method not found: ${command}`);
                }
            };
        }
        ProxyChannel.fromService = fromService;
        function toService(channel, options) {
            const disableMarshalling = options && options.disableMarshalling;
            return new Proxy({}, {
                get(_target, propKey) {
                    var _a;
                    if (typeof propKey === 'string') {
                        // Check for predefined values
                        if ((_a = options === null || options === void 0 ? void 0 : options.properties) === null || _a === void 0 ? void 0 : _a.has(propKey)) {
                            return options.properties.get(propKey);
                        }
                        // Event
                        if (propertyIsEvent(propKey)) {
                            return channel.listen(propKey);
                        }
                        // Function
                        return async function (...args) {
                            // Add context if any
                            let methodArgs;
                            if (options && !(0, types_1.isUndefinedOrNull)(options.context)) {
                                methodArgs = [options.context, ...args];
                            }
                            else {
                                methodArgs = args;
                            }
                            const result = await channel.call(propKey, methodArgs);
                            // Revive unless marshalling disabled
                            if (!disableMarshalling) {
                                return (0, marshalling_1.revive)(result);
                            }
                            return result;
                        };
                    }
                    throw new Error(`Property not found: ${String(propKey)}`);
                }
            });
        }
        ProxyChannel.toService = toService;
        function propertyIsEvent(name) {
            // Assume a property is an event if it has a form of "onSomething"
            return name[0] === 'o' && name[1] === 'n' && strings.isUpperAsciiLetter(name.charCodeAt(2));
        }
    })(ProxyChannel = exports.ProxyChannel || (exports.ProxyChannel = {}));
    const colorTables = [
        ['#2977B1', '#FC802D', '#34A13A', '#D3282F', '#9366BA'],
        ['#8B564C', '#E177C0', '#7F7F7F', '#BBBE3D', '#2EBECD']
    ];
    function prettyWithoutArrays(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data && typeof data === 'object' && typeof data.toString === 'function') {
            let result = data.toString();
            if (result !== '[object Object]') {
                return result;
            }
        }
        return data;
    }
    function pretty(data) {
        if (Array.isArray(data)) {
            return data.map(prettyWithoutArrays);
        }
        return prettyWithoutArrays(data);
    }
    function logWithColors(direction, totalLength, msgLength, req, initiator, str, data) {
        data = pretty(data);
        const colorTable = colorTables[initiator];
        const color = colorTable[req % colorTable.length];
        let args = [`%c[${direction}]%c[${String(totalLength).padStart(7, ' ')}]%c[len: ${String(msgLength).padStart(5, ' ')}]%c${String(req).padStart(5, ' ')} - ${str}`, 'color: darkgreen', 'color: grey', 'color: grey', `color: ${color}`];
        if (/\($/.test(str)) {
            args = args.concat(data);
            args.push(')');
        }
        else {
            args.push(data);
        }
        console.log.apply(console, args);
    }
    exports.logWithColors = logWithColors;
    class IPCLogger {
        constructor(_outgoingPrefix, _incomingPrefix) {
            this._outgoingPrefix = _outgoingPrefix;
            this._incomingPrefix = _incomingPrefix;
            this._totalIncoming = 0;
            this._totalOutgoing = 0;
        }
        logOutgoing(msgLength, requestId, initiator, str, data) {
            this._totalOutgoing += msgLength;
            logWithColors(this._outgoingPrefix, this._totalOutgoing, msgLength, requestId, initiator, str, data);
        }
        logIncoming(msgLength, requestId, initiator, str, data) {
            this._totalIncoming += msgLength;
            logWithColors(this._incomingPrefix, this._totalIncoming, msgLength, requestId, initiator, str, data);
        }
    }
    exports.IPCLogger = IPCLogger;
});
//# sourceMappingURL=ipc.js.map