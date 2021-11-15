/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "crypto", "net", "zlib", "vs/base/common/event", "vs/base/parts/ipc/common/ipc", "vs/base/common/path", "os", "vs/base/common/uuid", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/base/parts/ipc/common/ipc.net", "vs/base/common/errors", "vs/base/common/platform"], function (require, exports, crypto_1, net_1, zlib, event_1, ipc_1, path_1, os_1, uuid_1, lifecycle_1, buffer_1, ipc_net_1, errors_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connect = exports.serve = exports.Server = exports.createStaticIPCHandle = exports.createRandomIPCHandle = exports.XDG_RUNTIME_DIR = exports.WebSocketNodeSocket = exports.NodeSocket = void 0;
    class NodeSocket {
        constructor(socket) {
            this.socket = socket;
            this._errorListener = (err) => {
                if (err) {
                    if (err.code === 'EPIPE') {
                        // An EPIPE exception at the wrong time can lead to a renderer process crash
                        // so ignore the error since the socket will fire the close event soon anyways:
                        // > https://nodejs.org/api/errors.html#errors_common_system_errors
                        // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                        // > process to read the data. Commonly encountered at the net and http layers,
                        // > indicative that the remote side of the stream being written to has been closed.
                        return;
                    }
                    (0, errors_1.onUnexpectedError)(err);
                }
            };
            this.socket.on('error', this._errorListener);
        }
        dispose() {
            this.socket.off('error', this._errorListener);
            this.socket.destroy();
        }
        onData(_listener) {
            const listener = (buff) => _listener(buffer_1.VSBuffer.wrap(buff));
            this.socket.on('data', listener);
            return {
                dispose: () => this.socket.off('data', listener)
            };
        }
        onClose(listener) {
            this.socket.on('close', listener);
            return {
                dispose: () => this.socket.off('close', listener)
            };
        }
        onEnd(listener) {
            this.socket.on('end', listener);
            return {
                dispose: () => this.socket.off('end', listener)
            };
        }
        write(buffer) {
            // return early if socket has been destroyed in the meantime
            if (this.socket.destroyed) {
                return;
            }
            // we ignore the returned value from `write` because we would have to cached the data
            // anyways and nodejs is already doing that for us:
            // > https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
            // > However, the false return value is only advisory and the writable stream will unconditionally
            // > accept and buffer chunk even if it has not been allowed to drain.
            try {
                this.socket.write(buffer.buffer, (err) => {
                    if (err) {
                        if (err.code === 'EPIPE') {
                            // An EPIPE exception at the wrong time can lead to a renderer process crash
                            // so ignore the error since the socket will fire the close event soon anyways:
                            // > https://nodejs.org/api/errors.html#errors_common_system_errors
                            // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                            // > process to read the data. Commonly encountered at the net and http layers,
                            // > indicative that the remote side of the stream being written to has been closed.
                            return;
                        }
                        (0, errors_1.onUnexpectedError)(err);
                    }
                });
            }
            catch (err) {
                if (err.code === 'EPIPE') {
                    // An EPIPE exception at the wrong time can lead to a renderer process crash
                    // so ignore the error since the socket will fire the close event soon anyways:
                    // > https://nodejs.org/api/errors.html#errors_common_system_errors
                    // > EPIPE (Broken pipe): A write on a pipe, socket, or FIFO for which there is no
                    // > process to read the data. Commonly encountered at the net and http layers,
                    // > indicative that the remote side of the stream being written to has been closed.
                    return;
                }
                (0, errors_1.onUnexpectedError)(err);
            }
        }
        end() {
            this.socket.end();
        }
        drain() {
            return new Promise((resolve, reject) => {
                if (this.socket.bufferSize === 0) {
                    resolve();
                    return;
                }
                const finished = () => {
                    this.socket.off('close', finished);
                    this.socket.off('end', finished);
                    this.socket.off('error', finished);
                    this.socket.off('timeout', finished);
                    this.socket.off('drain', finished);
                    resolve();
                };
                this.socket.on('close', finished);
                this.socket.on('end', finished);
                this.socket.on('error', finished);
                this.socket.on('timeout', finished);
                this.socket.on('drain', finished);
            });
        }
    }
    exports.NodeSocket = NodeSocket;
    var Constants;
    (function (Constants) {
        Constants[Constants["MinHeaderByteSize"] = 2] = "MinHeaderByteSize";
    })(Constants || (Constants = {}));
    var ReadState;
    (function (ReadState) {
        ReadState[ReadState["PeekHeader"] = 1] = "PeekHeader";
        ReadState[ReadState["ReadHeader"] = 2] = "ReadHeader";
        ReadState[ReadState["ReadBody"] = 3] = "ReadBody";
        ReadState[ReadState["Fin"] = 4] = "Fin";
    })(ReadState || (ReadState = {}));
    /**
     * See https://tools.ietf.org/html/rfc6455#section-5.2
     */
    class WebSocketNodeSocket extends lifecycle_1.Disposable {
        /**
         * Create a socket which can communicate using WebSocket frames.
         *
         * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
         *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
         *  might hit an inflated portion referencing a distance too far back.
         *
         * @param socket The underlying socket
         * @param permessageDeflate Use the permessage-deflate WebSocket extension
         * @param inflateBytes "Seed" zlib inflate with these bytes.
         * @param recordInflateBytes Record all bytes sent to inflate
         */
        constructor(socket, permessageDeflate, inflateBytes, recordInflateBytes) {
            super();
            this._onDidZlibFlush = this._register(new event_1.Emitter());
            this._recordedInflateBytes = [];
            this._pendingInflateData = [];
            this._pendingDeflateData = [];
            this._onData = this._register(new event_1.Emitter());
            this._onClose = this._register(new event_1.Emitter());
            this._isEnded = false;
            this._state = {
                state: 1 /* PeekHeader */,
                readLen: 2 /* MinHeaderByteSize */,
                fin: 0,
                mask: 0
            };
            this.socket = socket;
            this._totalIncomingWireBytes = 0;
            this._totalIncomingDataBytes = 0;
            this._totalOutgoingWireBytes = 0;
            this._totalOutgoingDataBytes = 0;
            this.permessageDeflate = permessageDeflate;
            this._recordInflateBytes = recordInflateBytes;
            if (permessageDeflate) {
                // See https://tools.ietf.org/html/rfc7692#page-16
                // To simplify our logic, we don't negociate the window size
                // and simply dedicate (2^15) / 32kb per web socket
                this._zlibInflate = zlib.createInflateRaw({
                    windowBits: 15
                });
                this._zlibInflate.on('error', (err) => {
                    // zlib errors are fatal, since we have no idea how to recover
                    console.error(err);
                    (0, errors_1.onUnexpectedError)(err);
                    this._onClose.fire();
                });
                this._zlibInflate.on('data', (data) => {
                    this._pendingInflateData.push(data);
                });
                if (inflateBytes) {
                    this._zlibInflate.write(inflateBytes.buffer);
                    this._zlibInflate.flush(() => {
                        this._pendingInflateData.length = 0;
                    });
                }
                this._zlibDeflate = zlib.createDeflateRaw({
                    windowBits: 15
                });
                this._zlibDeflate.on('error', (err) => {
                    // zlib errors are fatal, since we have no idea how to recover
                    console.error(err);
                    (0, errors_1.onUnexpectedError)(err);
                    this._onClose.fire();
                });
                this._zlibDeflate.on('data', (data) => {
                    this._pendingDeflateData.push(data);
                });
            }
            else {
                this._zlibInflate = null;
                this._zlibDeflate = null;
            }
            this._zlibDeflateFlushWaitingCount = 0;
            this._incomingData = new ipc_net_1.ChunkStream();
            this._register(this.socket.onData(data => this._acceptChunk(data)));
            this._register(this.socket.onClose(() => this._onClose.fire()));
        }
        get totalIncomingWireBytes() {
            return this._totalIncomingWireBytes;
        }
        get totalIncomingDataBytes() {
            return this._totalIncomingDataBytes;
        }
        get totalOutgoingWireBytes() {
            return this._totalOutgoingWireBytes;
        }
        get totalOutgoingDataBytes() {
            return this._totalOutgoingDataBytes;
        }
        get recordedInflateBytes() {
            if (this._recordInflateBytes) {
                return buffer_1.VSBuffer.wrap(Buffer.concat(this._recordedInflateBytes));
            }
            return buffer_1.VSBuffer.alloc(0);
        }
        dispose() {
            if (this._zlibDeflateFlushWaitingCount > 0) {
                // Wait for any outstanding writes to finish before disposing
                this._register(this._onDidZlibFlush.event(() => {
                    this.dispose();
                }));
            }
            else {
                this.socket.dispose();
                super.dispose();
            }
        }
        onData(listener) {
            return this._onData.event(listener);
        }
        onClose(listener) {
            return this._onClose.event(listener);
        }
        onEnd(listener) {
            return this.socket.onEnd(listener);
        }
        write(buffer) {
            this._totalOutgoingDataBytes += buffer.byteLength;
            if (this._zlibDeflate) {
                this._zlibDeflate.write(buffer.buffer);
                this._zlibDeflateFlushWaitingCount++;
                // See https://zlib.net/manual.html#Constants
                this._zlibDeflate.flush(/*Z_SYNC_FLUSH*/ 2, () => {
                    this._zlibDeflateFlushWaitingCount--;
                    let data = Buffer.concat(this._pendingDeflateData);
                    this._pendingDeflateData.length = 0;
                    // See https://tools.ietf.org/html/rfc7692#section-7.2.1
                    data = data.slice(0, data.length - 4);
                    if (!this._isEnded) {
                        // Avoid ERR_STREAM_WRITE_AFTER_END
                        this._write(buffer_1.VSBuffer.wrap(data), true);
                    }
                    if (this._zlibDeflateFlushWaitingCount === 0) {
                        this._onDidZlibFlush.fire();
                    }
                });
            }
            else {
                this._write(buffer, false);
            }
        }
        _write(buffer, compressed) {
            let headerLen = 2 /* MinHeaderByteSize */;
            if (buffer.byteLength < 126) {
                headerLen += 0;
            }
            else if (buffer.byteLength < 2 ** 16) {
                headerLen += 2;
            }
            else {
                headerLen += 8;
            }
            const header = buffer_1.VSBuffer.alloc(headerLen);
            if (compressed) {
                // The RSV1 bit indicates a compressed frame
                header.writeUInt8(0b11000010, 0);
            }
            else {
                header.writeUInt8(0b10000010, 0);
            }
            if (buffer.byteLength < 126) {
                header.writeUInt8(buffer.byteLength, 1);
            }
            else if (buffer.byteLength < 2 ** 16) {
                header.writeUInt8(126, 1);
                let offset = 1;
                header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
            }
            else {
                header.writeUInt8(127, 1);
                let offset = 1;
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8(0, ++offset);
                header.writeUInt8((buffer.byteLength >>> 24) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 16) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 8) & 0b11111111, ++offset);
                header.writeUInt8((buffer.byteLength >>> 0) & 0b11111111, ++offset);
            }
            this._totalOutgoingWireBytes += header.byteLength + buffer.byteLength;
            this.socket.write(buffer_1.VSBuffer.concat([header, buffer]));
        }
        end() {
            this._isEnded = true;
            this.socket.end();
        }
        _acceptChunk(data) {
            if (data.byteLength === 0) {
                return;
            }
            this._totalIncomingWireBytes += data.byteLength;
            this._incomingData.acceptChunk(data);
            while (this._incomingData.byteLength >= this._state.readLen) {
                if (this._state.state === 1 /* PeekHeader */) {
                    // peek to see if we can read the entire header
                    const peekHeader = this._incomingData.peek(this._state.readLen);
                    const firstByte = peekHeader.readUInt8(0);
                    const finBit = (firstByte & 0b10000000) >>> 7;
                    const secondByte = peekHeader.readUInt8(1);
                    const hasMask = (secondByte & 0b10000000) >>> 7;
                    const len = (secondByte & 0b01111111);
                    this._state.state = 2 /* ReadHeader */;
                    this._state.readLen = 2 /* MinHeaderByteSize */ + (hasMask ? 4 : 0) + (len === 126 ? 2 : 0) + (len === 127 ? 8 : 0);
                    this._state.fin = finBit;
                    this._state.mask = 0;
                }
                else if (this._state.state === 2 /* ReadHeader */) {
                    // read entire header
                    const header = this._incomingData.read(this._state.readLen);
                    const secondByte = header.readUInt8(1);
                    const hasMask = (secondByte & 0b10000000) >>> 7;
                    let len = (secondByte & 0b01111111);
                    let offset = 1;
                    if (len === 126) {
                        len = (header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    else if (len === 127) {
                        len = (header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 0
                            + header.readUInt8(++offset) * 2 ** 24
                            + header.readUInt8(++offset) * 2 ** 16
                            + header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    let mask = 0;
                    if (hasMask) {
                        mask = (header.readUInt8(++offset) * 2 ** 24
                            + header.readUInt8(++offset) * 2 ** 16
                            + header.readUInt8(++offset) * 2 ** 8
                            + header.readUInt8(++offset));
                    }
                    this._state.state = 3 /* ReadBody */;
                    this._state.readLen = len;
                    this._state.mask = mask;
                }
                else if (this._state.state === 3 /* ReadBody */) {
                    // read body
                    const body = this._incomingData.read(this._state.readLen);
                    unmask(body, this._state.mask);
                    this._state.state = 1 /* PeekHeader */;
                    this._state.readLen = 2 /* MinHeaderByteSize */;
                    this._state.mask = 0;
                    if (this._zlibInflate) {
                        // See https://tools.ietf.org/html/rfc7692#section-7.2.2
                        if (this._recordInflateBytes) {
                            this._recordedInflateBytes.push(Buffer.from(body.buffer));
                        }
                        this._zlibInflate.write(body.buffer);
                        if (this._state.fin) {
                            if (this._recordInflateBytes) {
                                this._recordedInflateBytes.push(Buffer.from([0x00, 0x00, 0xff, 0xff]));
                            }
                            this._zlibInflate.write(Buffer.from([0x00, 0x00, 0xff, 0xff]));
                        }
                        this._zlibInflate.flush(() => {
                            const data = Buffer.concat(this._pendingInflateData);
                            this._pendingInflateData.length = 0;
                            this._totalIncomingDataBytes += data.length;
                            this._onData.fire(buffer_1.VSBuffer.wrap(data));
                        });
                    }
                    else {
                        this._totalIncomingDataBytes += body.byteLength;
                        this._onData.fire(body);
                    }
                }
            }
        }
        async drain() {
            if (this._zlibDeflateFlushWaitingCount > 0) {
                await event_1.Event.toPromise(this._onDidZlibFlush.event);
            }
            await this.socket.drain();
        }
    }
    exports.WebSocketNodeSocket = WebSocketNodeSocket;
    function unmask(buffer, mask) {
        if (mask === 0) {
            return;
        }
        let cnt = buffer.byteLength >>> 2;
        for (let i = 0; i < cnt; i++) {
            const v = buffer.readUInt32BE(i * 4);
            buffer.writeUInt32BE(v ^ mask, i * 4);
        }
        let offset = cnt * 4;
        let bytesLeft = buffer.byteLength - offset;
        const m3 = (mask >>> 24) & 0b11111111;
        const m2 = (mask >>> 16) & 0b11111111;
        const m1 = (mask >>> 8) & 0b11111111;
        if (bytesLeft >= 1) {
            buffer.writeUInt8(buffer.readUInt8(offset) ^ m3, offset);
        }
        if (bytesLeft >= 2) {
            buffer.writeUInt8(buffer.readUInt8(offset + 1) ^ m2, offset + 1);
        }
        if (bytesLeft >= 3) {
            buffer.writeUInt8(buffer.readUInt8(offset + 2) ^ m1, offset + 2);
        }
    }
    // Read this before there's any chance it is overwritten
    // Related to https://github.com/microsoft/vscode/issues/30624
    exports.XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
    const safeIpcPathLengths = {
        [2 /* Linux */]: 107,
        [1 /* Mac */]: 103
    };
    function createRandomIPCHandle() {
        const randomSuffix = (0, uuid_1.generateUuid)();
        // Windows: use named pipe
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\vscode-ipc-${randomSuffix}-sock`;
        }
        // Mac/Unix: use socket file and prefer
        // XDG_RUNTIME_DIR over tmpDir
        let result;
        if (exports.XDG_RUNTIME_DIR) {
            result = (0, path_1.join)(exports.XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
        }
        else {
            result = (0, path_1.join)((0, os_1.tmpdir)(), `vscode-ipc-${randomSuffix}.sock`);
        }
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.createRandomIPCHandle = createRandomIPCHandle;
    function createStaticIPCHandle(directoryPath, type, version) {
        const scope = (0, crypto_1.createHash)('md5').update(directoryPath).digest('hex');
        // Windows: use named pipe
        if (process.platform === 'win32') {
            return `\\\\.\\pipe\\${scope}-${version}-${type}-sock`;
        }
        // Mac/Unix: use socket file and prefer
        // XDG_RUNTIME_DIR over user data path
        // unless portable
        let result;
        if (exports.XDG_RUNTIME_DIR && !process.env['VSCODE_PORTABLE']) {
            result = (0, path_1.join)(exports.XDG_RUNTIME_DIR, `vscode-${scope.substr(0, 8)}-${version}-${type}.sock`);
        }
        else {
            result = (0, path_1.join)(directoryPath, `${version}-${type}.sock`);
        }
        // Validate length
        validateIPCHandleLength(result);
        return result;
    }
    exports.createStaticIPCHandle = createStaticIPCHandle;
    function validateIPCHandleLength(handle) {
        const limit = safeIpcPathLengths[platform_1.platform];
        if (typeof limit === 'number' && handle.length >= limit) {
            // https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
            console.warn(`WARNING: IPC handle "${handle}" is longer than ${limit} chars, try a shorter --user-data-dir`);
        }
    }
    class Server extends ipc_1.IPCServer {
        constructor(server) {
            super(Server.toClientConnectionEvent(server));
            this.server = server;
        }
        static toClientConnectionEvent(server) {
            const onConnection = event_1.Event.fromNodeEventEmitter(server, 'connection');
            return event_1.Event.map(onConnection, socket => ({
                protocol: new ipc_net_1.Protocol(new NodeSocket(socket)),
                onDidClientDisconnect: event_1.Event.once(event_1.Event.fromNodeEventEmitter(socket, 'close'))
            }));
        }
        dispose() {
            super.dispose();
            if (this.server) {
                this.server.close();
                this.server = null;
            }
        }
    }
    exports.Server = Server;
    function serve(hook) {
        return new Promise((c, e) => {
            const server = (0, net_1.createServer)();
            server.on('error', e);
            server.listen(hook, () => {
                server.removeListener('error', e);
                c(new Server(server));
            });
        });
    }
    exports.serve = serve;
    function connect(hook, clientId) {
        return new Promise((c, e) => {
            const socket = (0, net_1.createConnection)(hook, () => {
                socket.removeListener('error', e);
                c(ipc_net_1.Client.fromSocket(new NodeSocket(socket), clientId));
            });
            socket.once('error', e);
        });
    }
    exports.connect = connect;
});
//# sourceMappingURL=ipc.net.js.map