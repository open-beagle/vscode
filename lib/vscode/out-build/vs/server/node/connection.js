define(["require", "exports", "@coder/logger", "child_process", "vs/base/common/event", "vs/base/common/network", "vs/server/node/nls"], function (require, exports, logger_1, cp, event_1, network_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostConnection = exports.ManagementConnection = exports.Connection = void 0;
    class Connection {
        constructor(protocol, name) {
            this.protocol = protocol;
            this.name = name;
            this._onClose = new event_1.Emitter();
            /**
             * Fire when the connection is closed (not just disconnected). This should
             * only happen when the connection is offline and old or has an error.
             */
            this.onClose = this._onClose.event;
            this.disposed = false;
            this.logger = logger_1.logger.named(this.name, (0, logger_1.field)('token', this.protocol.options.reconnectionToken));
            this.logger.debug('Connecting...');
            this.onClose(() => this.logger.debug('Closed'));
        }
        get offline() {
            return this._offline;
        }
        reconnect(protocol) {
            this.logger.debug('Reconnecting...');
            this._offline = undefined;
            this.doReconnect(protocol);
        }
        dispose(reason) {
            this.logger.debug('Disposing...', (0, logger_1.field)('reason', reason));
            if (!this.disposed) {
                this.disposed = true;
                this.doDispose();
                this._onClose.fire();
            }
        }
        setOffline() {
            this.logger.debug('Disconnected');
            if (!this._offline) {
                this._offline = Date.now();
            }
        }
    }
    exports.Connection = Connection;
    /**
     * Used for all the IPC channels.
     */
    class ManagementConnection extends Connection {
        constructor(protocol) {
            super(protocol, 'management');
            protocol.onDidDispose(() => this.dispose()); // Explicit close.
            protocol.onSocketClose(() => this.setOffline()); // Might reconnect.
            protocol.sendMessage({ type: 'ok' });
        }
        doDispose() {
            this.protocol.destroy();
        }
        doReconnect(protocol) {
            protocol.sendMessage({ type: 'ok' });
            this.protocol.beginAcceptReconnection(protocol.getSocket(), protocol.readEntireBuffer());
            this.protocol.endAcceptReconnection();
            protocol.dispose();
        }
    }
    exports.ManagementConnection = ManagementConnection;
    class ExtensionHostConnection extends Connection {
        constructor(protocol, params, environment) {
            super(protocol, 'exthost');
            this.params = params;
            this.environment = environment;
            protocol.sendMessage({ debugPort: this.params.port });
            const buffer = protocol.readEntireBuffer();
            const inflateBytes = protocol.inflateBytes;
            protocol.dispose();
            protocol.getUnderlyingSocket().pause();
            this.spawn(buffer, inflateBytes).then((p) => this.process = p);
        }
        doDispose() {
            this.protocol.destroy();
            if (this.process) {
                this.process.kill();
            }
        }
        doReconnect(protocol) {
            protocol.sendMessage({ debugPort: this.params.port });
            const buffer = protocol.readEntireBuffer();
            const inflateBytes = protocol.inflateBytes;
            protocol.dispose();
            protocol.getUnderlyingSocket().pause();
            this.protocol.setSocket(protocol.getSocket());
            this.sendInitMessage(buffer, inflateBytes);
        }
        sendInitMessage(buffer, inflateBytes) {
            if (!this.process) {
                throw new Error('Tried to initialize VS Code before spawning');
            }
            this.logger.debug('Sending socket');
            // TODO: Do something with the debug port.
            this.process.send({
                type: 'VSCODE_EXTHOST_IPC_SOCKET',
                initialDataChunk: Buffer.from(buffer.buffer).toString('base64'),
                skipWebSocketFrames: this.protocol.options.skipWebSocketFrames,
                permessageDeflate: this.protocol.options.permessageDeflate,
                inflateBytes: inflateBytes ? Buffer.from(inflateBytes).toString('base64') : undefined,
            }, this.protocol.getUnderlyingSocket());
        }
        async spawn(buffer, inflateBytes) {
            this.logger.debug('Getting NLS configuration...');
            const config = await (0, nls_1.getNlsConfiguration)(this.params.language, this.environment.userDataPath);
            this.logger.debug('Spawning extension host...');
            const proc = cp.fork(network_1.FileAccess.asFileUri('bootstrap-fork', require).fsPath, 
            // While not technically necessary, makes it easier to tell which process
            // bootstrap-fork is executing. Can also do pkill -f extensionHost
            // Other spawns in the VS Code codebase behave similarly.
            ['--type=extensionHost'], {
                env: Object.assign(Object.assign({}, process.env), { VSCODE_AMD_ENTRYPOINT: 'vs/workbench/services/extensions/node/extensionHostProcess', VSCODE_PIPE_LOGGING: 'true', VSCODE_VERBOSE_LOGGING: 'true', VSCODE_EXTHOST_WILL_SEND_SOCKET: 'true', VSCODE_HANDLES_UNCAUGHT_ERRORS: 'true', VSCODE_LOG_STACK: 'false', VSCODE_LOG_LEVEL: process.env.LOG_LEVEL, VSCODE_NLS_CONFIG: JSON.stringify(config), VSCODE_PARENT_PID: String(process.pid) }),
                silent: true,
            });
            proc.on('error', (error) => {
                this.logger.error('Exited unexpectedly', (0, logger_1.field)('error', error));
                this.dispose();
            });
            proc.on('exit', (code) => {
                this.logger.debug('Exited', (0, logger_1.field)('code', code));
                this.dispose();
            });
            if (proc.stdout && proc.stderr) {
                proc.stdout.setEncoding('utf8').on('data', (d) => this.logger.info(d));
                proc.stderr.setEncoding('utf8').on('data', (d) => this.logger.error(d));
            }
            proc.on('message', (event) => {
                switch (event.type) {
                    case '__$console':
                        const fn = this.logger[event.severity === 'log' ? 'info' : event.severity];
                        if (fn) {
                            fn.bind(this.logger)('console', (0, logger_1.field)('arguments', event.arguments));
                        }
                        else {
                            this.logger.error('Unexpected severity', (0, logger_1.field)('event', event));
                        }
                        break;
                    case 'VSCODE_EXTHOST_DISCONNECTED':
                        this.logger.debug('Got disconnected message');
                        this.setOffline();
                        break;
                    case 'VSCODE_EXTHOST_IPC_READY':
                        this.logger.debug('Handshake completed');
                        this.sendInitMessage(buffer, inflateBytes);
                        break;
                    default:
                        this.logger.error('Unexpected message', (0, logger_1.field)('event', event));
                        break;
                }
            });
            this.logger.debug('Waiting for handshake...');
            return proc;
        }
    }
    exports.ExtensionHostConnection = ExtensionHostConnection;
});
//# sourceMappingURL=connection.js.map