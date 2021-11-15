define(["require", "exports", "@coder/logger", "vs/base/common/buffer", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net"], function (require, exports, logger_1, buffer_1, ipc_net_1, ipc_net_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Protocol = void 0;
    class Protocol extends ipc_net_1.PersistentProtocol {
        constructor(socket, options) {
            super(options.skipWebSocketFrames
                ? new ipc_net_2.NodeSocket(socket)
                : new ipc_net_2.WebSocketNodeSocket(new ipc_net_2.NodeSocket(socket), options.permessageDeflate || false, options.inflateBytes || null, 
                // Always record inflate bytes if using permessage-deflate.
                options.permessageDeflate || false));
            this.options = options;
            this.logger = logger_1.logger.named('protocol', (0, logger_1.field)('token', this.options.reconnectionToken));
        }
        getUnderlyingSocket() {
            const socket = this.getSocket();
            return socket instanceof ipc_net_2.NodeSocket
                ? socket.socket
                : socket.socket.socket;
        }
        /**
         * Perform a handshake to get a connection request.
         */
        handshake() {
            this.logger.debug('Initiating handshake...');
            return new Promise((resolve, reject) => {
                const cleanup = () => {
                    handler.dispose();
                    onClose.dispose();
                    clearTimeout(timeout);
                };
                const onClose = this.onSocketClose(() => {
                    cleanup();
                    this.logger.debug('Handshake failed');
                    reject(new Error('Protocol socket closed unexpectedly'));
                });
                const timeout = setTimeout(() => {
                    cleanup();
                    this.logger.debug('Handshake timed out');
                    reject(new Error('Protocol handshake timed out'));
                }, 10000); // Matches the client timeout.
                const handler = this.onControlMessage((rawMessage) => {
                    try {
                        const raw = rawMessage.toString();
                        this.logger.trace('Got message', (0, logger_1.field)('message', raw));
                        const message = JSON.parse(raw);
                        switch (message.type) {
                            case 'auth':
                                return this.authenticate(message);
                            case 'connectionType':
                                cleanup();
                                this.logger.debug('Handshake completed');
                                return resolve(message);
                            default:
                                throw new Error('Unrecognized message type');
                        }
                    }
                    catch (error) {
                        cleanup();
                        reject(error);
                    }
                });
                // Kick off the handshake in case we missed the client's opening shot.
                // TODO: Investigate why that message seems to get lost.
                this.authenticate();
            });
        }
        /**
         * TODO: This ignores the authentication process entirely for now.
         */
        authenticate(_) {
            this.sendMessage({ type: 'sign', data: '' });
        }
        /**
         * TODO: implement.
         */
        tunnel() {
            throw new Error('Tunnel is not implemented yet');
        }
        /**
         * Send a handshake message. In the case of the extension host it should just
         * send a debug port.
         */
        sendMessage(message) {
            this.sendControl(buffer_1.VSBuffer.fromString(JSON.stringify(message)));
        }
        /**
         * Disconnect and dispose everything including the underlying socket.
         */
        destroy(reason) {
            try {
                if (reason) {
                    this.sendMessage({ type: 'error', reason });
                }
                // If still connected try notifying the client.
                this.sendDisconnect();
            }
            catch (error) {
                // I think the write might fail if already disconnected.
                this.logger.warn(error.message || error);
            }
            this.dispose(); // This disposes timers and socket event handlers.
            this.getSocket().dispose(); // This will destroy() the socket.
        }
        /**
         * Get inflateBytes from the current socket.
         */
        get inflateBytes() {
            const socket = this.getSocket();
            return socket instanceof ipc_net_2.WebSocketNodeSocket
                ? socket.recordedInflateBytes.buffer
                : undefined;
        }
    }
    exports.Protocol = Protocol;
});
//# sourceMappingURL=protocol.js.map