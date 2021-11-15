/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/common/ipc.net", "vs/base/common/uuid", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/base/common/event", "vs/platform/remote/common/remoteAuthorityResolver", "vs/base/common/errors", "vs/base/common/async", "vs/base/common/cancellation"], function (require, exports, ipc_net_1, uuid_1, lifecycle_1, buffer_1, event_1, remoteAuthorityResolver_1, errors_1, async_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostPersistentConnection = exports.ManagementPersistentConnection = exports.ReconnectionPermanentFailureEvent = exports.ConnectionGainEvent = exports.ReconnectionRunningEvent = exports.ReconnectionWaitEvent = exports.ConnectionLostEvent = exports.PersistentConnectionEventType = exports.connectRemoteAgentTunnel = exports.connectRemoteAgentExtensionHost = exports.connectRemoteAgentManagement = exports.ConnectionType = void 0;
    const RECONNECT_TIMEOUT = 30 * 1000 /* 30s */;
    var ConnectionType;
    (function (ConnectionType) {
        ConnectionType[ConnectionType["Management"] = 1] = "Management";
        ConnectionType[ConnectionType["ExtensionHost"] = 2] = "ExtensionHost";
        ConnectionType[ConnectionType["Tunnel"] = 3] = "Tunnel";
    })(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
    function connectionTypeToString(connectionType) {
        switch (connectionType) {
            case 1 /* Management */:
                return 'Management';
            case 2 /* ExtensionHost */:
                return 'ExtensionHost';
            case 3 /* Tunnel */:
                return 'Tunnel';
        }
    }
    function createTimeoutCancellation(millis) {
        const source = new cancellation_1.CancellationTokenSource();
        setTimeout(() => source.cancel(), millis);
        return source.token;
    }
    function combineTimeoutCancellation(a, b) {
        if (a.isCancellationRequested || b.isCancellationRequested) {
            return cancellation_1.CancellationToken.Cancelled;
        }
        const source = new cancellation_1.CancellationTokenSource();
        a.onCancellationRequested(() => source.cancel());
        b.onCancellationRequested(() => source.cancel());
        return source.token;
    }
    class PromiseWithTimeout {
        constructor(timeoutCancellationToken) {
            this._state = 'pending';
            this._disposables = new lifecycle_1.DisposableStore();
            this.promise = new Promise((resolve, reject) => {
                this._resolvePromise = resolve;
                this._rejectPromise = reject;
            });
            if (timeoutCancellationToken.isCancellationRequested) {
                this._timeout();
            }
            else {
                this._disposables.add(timeoutCancellationToken.onCancellationRequested(() => this._timeout()));
            }
        }
        get didTimeout() {
            return (this._state === 'timedout');
        }
        registerDisposable(disposable) {
            if (this._state === 'pending') {
                this._disposables.add(disposable);
            }
            else {
                disposable.dispose();
            }
        }
        _timeout() {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'timedout';
            this._rejectPromise(this._createTimeoutError());
        }
        _createTimeoutError() {
            const err = new Error('Time limit reached');
            err.code = 'ETIMEDOUT';
            err.syscall = 'connect';
            return err;
        }
        resolve(value) {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'resolved';
            this._resolvePromise(value);
        }
        reject(err) {
            if (this._state !== 'pending') {
                return;
            }
            this._disposables.dispose();
            this._state = 'rejected';
            this._rejectPromise(err);
        }
    }
    function readOneControlMessage(protocol, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        result.registerDisposable(protocol.onControlMessage(raw => {
            const msg = JSON.parse(raw.toString());
            const error = getErrorFromMessage(msg);
            if (error) {
                result.reject(error);
            }
            else {
                result.resolve(msg);
            }
        }));
        return result.promise;
    }
    function createSocket(logService, socketFactory, host, port, query, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        socketFactory.connect(host, port, query, (err, socket) => {
            if (result.didTimeout) {
                if (err) {
                    logService.error(err);
                }
                socket === null || socket === void 0 ? void 0 : socket.dispose();
            }
            else {
                if (err || !socket) {
                    result.reject(err);
                }
                else {
                    result.resolve(socket);
                }
            }
        });
        return result.promise;
    }
    function raceWithTimeoutCancellation(promise, timeoutCancellationToken) {
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        promise.then((res) => {
            if (!result.didTimeout) {
                result.resolve(res);
            }
        }, (err) => {
            if (!result.didTimeout) {
                result.reject(err);
            }
        });
        return result.promise;
    }
    async function connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken) {
        const logPrefix = connectLogPrefix(options, connectionType);
        options.logService.trace(`${logPrefix} 1/6. invoking socketFactory.connect().`);
        let socket;
        try {
            // NOTE@coder: Add connection type to the socket. This is so they can be
            // distinguished by the backend.
            socket = await createSocket(options.logService, options.socketFactory, options.host, options.port, `type=${connectionTypeToString(connectionType)}&reconnectionToken=${options.reconnectionToken}&reconnection=${options.reconnectionProtocol ? 'true' : 'false'}`, timeoutCancellationToken);
        }
        catch (error) {
            options.logService.error(`${logPrefix} socketFactory.connect() failed or timed out. Error:`);
            options.logService.error(error);
            throw error;
        }
        options.logService.trace(`${logPrefix} 2/6. socketFactory.connect() was successful.`);
        let protocol;
        let ownsProtocol;
        if (options.reconnectionProtocol) {
            options.reconnectionProtocol.beginAcceptReconnection(socket, null);
            protocol = options.reconnectionProtocol;
            ownsProtocol = false;
        }
        else {
            protocol = new ipc_net_1.PersistentProtocol(socket, null);
            ownsProtocol = true;
        }
        options.logService.trace(`${logPrefix} 3/6. sending AuthRequest control message.`);
        const authRequest = {
            type: 'auth',
            auth: options.connectionToken || '00000000000000000000'
        };
        protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(authRequest)));
        try {
            const msg = await readOneControlMessage(protocol, combineTimeoutCancellation(timeoutCancellationToken, createTimeoutCancellation(10000)));
            if (msg.type !== 'sign' || typeof msg.data !== 'string') {
                const error = new Error('Unexpected handshake message');
                error.code = 'VSCODE_CONNECTION_ERROR';
                throw error;
            }
            options.logService.trace(`${logPrefix} 4/6. received SignRequest control message.`);
            const signed = await raceWithTimeoutCancellation(options.signService.sign(msg.data), timeoutCancellationToken);
            const connTypeRequest = {
                type: 'connectionType',
                commit: options.commit,
                signedData: signed,
                desiredConnectionType: connectionType
            };
            if (args) {
                connTypeRequest.args = args;
            }
            options.logService.trace(`${logPrefix} 5/6. sending ConnectionTypeRequest control message.`);
            protocol.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(connTypeRequest)));
            return { protocol, ownsProtocol };
        }
        catch (error) {
            if (error && error.code === 'ETIMEDOUT') {
                options.logService.error(`${logPrefix} the handshake timed out. Error:`);
                options.logService.error(error);
            }
            if (error && error.code === 'VSCODE_CONNECTION_ERROR') {
                options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
                options.logService.error(error);
            }
            if (ownsProtocol) {
                safeDisposeProtocolAndSocket(protocol);
            }
            throw error;
        }
    }
    async function connectToRemoteExtensionHostAgentAndReadOneMessage(options, connectionType, args, timeoutCancellationToken) {
        const startTime = Date.now();
        const logPrefix = connectLogPrefix(options, connectionType);
        const { protocol, ownsProtocol } = await connectToRemoteExtensionHostAgent(options, connectionType, args, timeoutCancellationToken);
        const result = new PromiseWithTimeout(timeoutCancellationToken);
        result.registerDisposable(protocol.onControlMessage(raw => {
            const msg = JSON.parse(raw.toString());
            const error = getErrorFromMessage(msg);
            if (error) {
                options.logService.error(`${logPrefix} received error control message when negotiating connection. Error:`);
                options.logService.error(error);
                if (ownsProtocol) {
                    safeDisposeProtocolAndSocket(protocol);
                }
                result.reject(error);
            }
            else {
                if (options.reconnectionProtocol) {
                    options.reconnectionProtocol.endAcceptReconnection();
                }
                options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
                result.resolve({ protocol, firstMessage: msg });
            }
        }));
        return result.promise;
    }
    async function doConnectRemoteAgentManagement(options, timeoutCancellationToken) {
        const { protocol } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 1 /* Management */, undefined, timeoutCancellationToken);
        return { protocol };
    }
    async function doConnectRemoteAgentExtensionHost(options, startArguments, timeoutCancellationToken) {
        const { protocol, firstMessage } = await connectToRemoteExtensionHostAgentAndReadOneMessage(options, 2 /* ExtensionHost */, startArguments, timeoutCancellationToken);
        const debugPort = firstMessage && firstMessage.debugPort;
        return { protocol, debugPort };
    }
    async function doConnectRemoteAgentTunnel(options, startParams, timeoutCancellationToken) {
        const startTime = Date.now();
        const logPrefix = connectLogPrefix(options, 3 /* Tunnel */);
        const { protocol } = await connectToRemoteExtensionHostAgent(options, 3 /* Tunnel */, startParams, timeoutCancellationToken);
        options.logService.trace(`${logPrefix} 6/6. handshake finished, connection is up and running after ${logElapsed(startTime)}!`);
        return protocol;
    }
    async function resolveConnectionOptions(options, reconnectionToken, reconnectionProtocol) {
        const { host, port, connectionToken } = await options.addressProvider.getAddress();
        return {
            commit: options.commit,
            host: host,
            port: port,
            connectionToken: connectionToken,
            reconnectionToken: reconnectionToken,
            reconnectionProtocol: reconnectionProtocol,
            socketFactory: options.socketFactory,
            signService: options.signService,
            logService: options.logService
        };
    }
    async function connectRemoteAgentManagement(options, remoteAuthority, clientId) {
        try {
            const reconnectionToken = (0, uuid_1.generateUuid)();
            const simpleOptions = await resolveConnectionOptions(options, reconnectionToken, null);
            const { protocol } = await doConnectRemoteAgentManagement(simpleOptions, cancellation_1.CancellationToken.None);
            return new ManagementPersistentConnection(options, remoteAuthority, clientId, reconnectionToken, protocol);
        }
        catch (err) {
            options.logService.error(`[remote-connection] An error occurred in the very first connect attempt, it will be treated as a permanent error! Error:`);
            options.logService.error(err);
            PersistentConnection.triggerPermanentFailure(0, 0, remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err));
            throw err;
        }
    }
    exports.connectRemoteAgentManagement = connectRemoteAgentManagement;
    async function connectRemoteAgentExtensionHost(options, startArguments) {
        try {
            const reconnectionToken = (0, uuid_1.generateUuid)();
            const simpleOptions = await resolveConnectionOptions(options, reconnectionToken, null);
            const { protocol, debugPort } = await doConnectRemoteAgentExtensionHost(simpleOptions, startArguments, cancellation_1.CancellationToken.None);
            return new ExtensionHostPersistentConnection(options, startArguments, reconnectionToken, protocol, debugPort);
        }
        catch (err) {
            options.logService.error(`[remote-connection] An error occurred in the very first connect attempt, it will be treated as a permanent error! Error:`);
            options.logService.error(err);
            PersistentConnection.triggerPermanentFailure(0, 0, remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err));
            throw err;
        }
    }
    exports.connectRemoteAgentExtensionHost = connectRemoteAgentExtensionHost;
    async function connectRemoteAgentTunnel(options, tunnelRemotePort) {
        const simpleOptions = await resolveConnectionOptions(options, (0, uuid_1.generateUuid)(), null);
        const protocol = await doConnectRemoteAgentTunnel(simpleOptions, { port: tunnelRemotePort }, cancellation_1.CancellationToken.None);
        return protocol;
    }
    exports.connectRemoteAgentTunnel = connectRemoteAgentTunnel;
    function sleep(seconds) {
        return (0, async_1.createCancelablePromise)(token => {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, seconds * 1000);
                token.onCancellationRequested(() => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        });
    }
    var PersistentConnectionEventType;
    (function (PersistentConnectionEventType) {
        PersistentConnectionEventType[PersistentConnectionEventType["ConnectionLost"] = 0] = "ConnectionLost";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionWait"] = 1] = "ReconnectionWait";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionRunning"] = 2] = "ReconnectionRunning";
        PersistentConnectionEventType[PersistentConnectionEventType["ReconnectionPermanentFailure"] = 3] = "ReconnectionPermanentFailure";
        PersistentConnectionEventType[PersistentConnectionEventType["ConnectionGain"] = 4] = "ConnectionGain";
    })(PersistentConnectionEventType = exports.PersistentConnectionEventType || (exports.PersistentConnectionEventType = {}));
    class ConnectionLostEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.type = 0 /* ConnectionLost */;
        }
    }
    exports.ConnectionLostEvent = ConnectionLostEvent;
    class ReconnectionWaitEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, durationSeconds, cancellableTimer) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.durationSeconds = durationSeconds;
            this.cancellableTimer = cancellableTimer;
            this.type = 1 /* ReconnectionWait */;
        }
        skipWait() {
            this.cancellableTimer.cancel();
        }
    }
    exports.ReconnectionWaitEvent = ReconnectionWaitEvent;
    class ReconnectionRunningEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 2 /* ReconnectionRunning */;
        }
    }
    exports.ReconnectionRunningEvent = ReconnectionRunningEvent;
    class ConnectionGainEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.type = 4 /* ConnectionGain */;
        }
    }
    exports.ConnectionGainEvent = ConnectionGainEvent;
    class ReconnectionPermanentFailureEvent {
        constructor(reconnectionToken, millisSinceLastIncomingData, attempt, handled) {
            this.reconnectionToken = reconnectionToken;
            this.millisSinceLastIncomingData = millisSinceLastIncomingData;
            this.attempt = attempt;
            this.handled = handled;
            this.type = 3 /* ReconnectionPermanentFailure */;
        }
    }
    exports.ReconnectionPermanentFailureEvent = ReconnectionPermanentFailureEvent;
    class PersistentConnection extends lifecycle_1.Disposable {
        constructor(_connectionType, options, reconnectionToken, protocol) {
            super();
            this._connectionType = _connectionType;
            this._onDidStateChange = this._register(new event_1.Emitter());
            this.onDidStateChange = this._onDidStateChange.event;
            this._options = options;
            this.reconnectionToken = reconnectionToken;
            this.protocol = protocol;
            this._isReconnecting = false;
            this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, 0, 0));
            this._register(protocol.onSocketClose(() => this._beginReconnecting()));
            this._register(protocol.onSocketTimeout(() => this._beginReconnecting()));
            PersistentConnection._instances.push(this);
            if (PersistentConnection._permanentFailure) {
                this._gotoPermanentFailure(PersistentConnection._permanentFailureMillisSinceLastIncomingData, PersistentConnection._permanentFailureAttempt, PersistentConnection._permanentFailureHandled);
            }
        }
        static triggerPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            this._permanentFailure = true;
            this._permanentFailureMillisSinceLastIncomingData = millisSinceLastIncomingData;
            this._permanentFailureAttempt = attempt;
            this._permanentFailureHandled = handled;
            this._instances.forEach(instance => instance._gotoPermanentFailure(this._permanentFailureMillisSinceLastIncomingData, this._permanentFailureAttempt, this._permanentFailureHandled));
        }
        async _beginReconnecting() {
            // Only have one reconnection loop active at a time.
            if (this._isReconnecting) {
                return;
            }
            try {
                this._isReconnecting = true;
                await this._runReconnectingLoop();
            }
            finally {
                this._isReconnecting = false;
            }
        }
        async _runReconnectingLoop() {
            if (PersistentConnection._permanentFailure) {
                // no more attempts!
                return;
            }
            const logPrefix = commonLogPrefix(this._connectionType, this.reconnectionToken, true);
            this._options.logService.info(`${logPrefix} starting reconnecting loop. You can get more information with the trace log level.`);
            this._onDidStateChange.fire(new ConnectionLostEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData()));
            const TIMES = [0, 5, 5, 10, 10, 10, 10, 10, 30];
            const disconnectStartTime = Date.now();
            let attempt = -1;
            do {
                attempt++;
                const waitTime = (attempt < TIMES.length ? TIMES[attempt] : TIMES[TIMES.length - 1]);
                try {
                    if (waitTime > 0) {
                        const sleepPromise = sleep(waitTime);
                        this._onDidStateChange.fire(new ReconnectionWaitEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), waitTime, sleepPromise));
                        this._options.logService.info(`${logPrefix} waiting for ${waitTime} seconds before reconnecting...`);
                        try {
                            await sleepPromise;
                        }
                        catch (_a) { } // User canceled timer
                    }
                    if (PersistentConnection._permanentFailure) {
                        this._options.logService.error(`${logPrefix} permanent failure occurred while running the reconnecting loop.`);
                        break;
                    }
                    // connection was lost, let's try to re-establish it
                    this._onDidStateChange.fire(new ReconnectionRunningEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    this._options.logService.info(`${logPrefix} resolving connection...`);
                    const simpleOptions = await resolveConnectionOptions(this._options, this.reconnectionToken, this.protocol);
                    this._options.logService.info(`${logPrefix} connecting to ${simpleOptions.host}:${simpleOptions.port}...`);
                    await this._reconnect(simpleOptions, createTimeoutCancellation(RECONNECT_TIMEOUT));
                    this._options.logService.info(`${logPrefix} reconnected!`);
                    this._onDidStateChange.fire(new ConnectionGainEvent(this.reconnectionToken, this.protocol.getMillisSinceLastIncomingData(), attempt + 1));
                    break;
                }
                catch (err) {
                    if (err.code === 'VSCODE_CONNECTION_ERROR') {
                        this._options.logService.error(`${logPrefix} A permanent error occurred in the reconnecting loop! Will give up now! Error:`);
                        this._options.logService.error(err);
                        PersistentConnection.triggerPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (Date.now() - disconnectStartTime > 10800000 /* ReconnectionGraceTime */) {
                        this._options.logService.error(`${logPrefix} An error occurred while reconnecting, but it will be treated as a permanent error because the reconnection grace time has expired! Will give up now! Error:`);
                        this._options.logService.error(err);
                        PersistentConnection.triggerPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                        break;
                    }
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isTemporarilyNotAvailable(err)) {
                        this._options.logService.info(`${logPrefix} A temporarily not available error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((err.code === 'ETIMEDOUT' || err.code === 'ENETUNREACH' || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') && err.syscall === 'connect') {
                        this._options.logService.info(`${logPrefix} A network error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if ((0, errors_1.isPromiseCanceledError)(err)) {
                        this._options.logService.info(`${logPrefix} A promise cancelation error occurred while trying to reconnect, will try again...`);
                        this._options.logService.trace(err);
                        // try again!
                        continue;
                    }
                    if (err instanceof remoteAuthorityResolver_1.RemoteAuthorityResolverError) {
                        this._options.logService.error(`${logPrefix} A RemoteAuthorityResolverError occurred while trying to reconnect. Will give up now! Error:`);
                        this._options.logService.error(err);
                        PersistentConnection.triggerPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err));
                        break;
                    }
                    this._options.logService.error(`${logPrefix} An unknown error occurred while trying to reconnect, since this is an unknown case, it will be treated as a permanent error! Will give up now! Error:`);
                    this._options.logService.error(err);
                    PersistentConnection.triggerPermanentFailure(this.protocol.getMillisSinceLastIncomingData(), attempt + 1, false);
                    break;
                }
            } while (!PersistentConnection._permanentFailure);
        }
        _gotoPermanentFailure(millisSinceLastIncomingData, attempt, handled) {
            this._onDidStateChange.fire(new ReconnectionPermanentFailureEvent(this.reconnectionToken, millisSinceLastIncomingData, attempt, handled));
            safeDisposeProtocolAndSocket(this.protocol);
        }
    }
    PersistentConnection._permanentFailure = false;
    PersistentConnection._permanentFailureMillisSinceLastIncomingData = 0;
    PersistentConnection._permanentFailureAttempt = 0;
    PersistentConnection._permanentFailureHandled = false;
    PersistentConnection._instances = [];
    class ManagementPersistentConnection extends PersistentConnection {
        constructor(options, remoteAuthority, clientId, reconnectionToken, protocol) {
            super(1 /* Management */, options, reconnectionToken, protocol);
            this.client = this._register(new ipc_net_1.Client(protocol, {
                remoteAuthority: remoteAuthority,
                clientId: clientId
            }, options.ipcLogger));
        }
        async _reconnect(options, timeoutCancellationToken) {
            await doConnectRemoteAgentManagement(options, timeoutCancellationToken);
        }
    }
    exports.ManagementPersistentConnection = ManagementPersistentConnection;
    class ExtensionHostPersistentConnection extends PersistentConnection {
        constructor(options, startArguments, reconnectionToken, protocol, debugPort) {
            super(2 /* ExtensionHost */, options, reconnectionToken, protocol);
            this._startArguments = startArguments;
            this.debugPort = debugPort;
        }
        async _reconnect(options, timeoutCancellationToken) {
            await doConnectRemoteAgentExtensionHost(options, this._startArguments, timeoutCancellationToken);
        }
    }
    exports.ExtensionHostPersistentConnection = ExtensionHostPersistentConnection;
    function safeDisposeProtocolAndSocket(protocol) {
        try {
            protocol.acceptDisconnect();
            const socket = protocol.getSocket();
            protocol.dispose();
            socket.dispose();
        }
        catch (err) {
            (0, errors_1.onUnexpectedError)(err);
        }
    }
    function getErrorFromMessage(msg) {
        if (msg && msg.type === 'error') {
            const error = new Error(`Connection error: ${msg.reason}`);
            error.code = 'VSCODE_CONNECTION_ERROR';
            return error;
        }
        return null;
    }
    function stringRightPad(str, len) {
        while (str.length < len) {
            str += ' ';
        }
        return str;
    }
    function commonLogPrefix(connectionType, reconnectionToken, isReconnect) {
        return `[remote-connection][${stringRightPad(connectionTypeToString(connectionType), 13)}][${reconnectionToken.substr(0, 5)}…][${isReconnect ? 'reconnect' : 'initial'}]`;
    }
    function connectLogPrefix(options, connectionType) {
        return `${commonLogPrefix(connectionType, options.reconnectionToken, !!options.reconnectionProtocol)}[${options.host}:${options.port}]`;
    }
    function logElapsed(startTime) {
        return `${Date.now() - startTime} ms`;
    }
});
//# sourceMappingURL=remoteAgentConnection.js.map